"""
Workflow execution engine for backend nodes
Handles AI Agent, API Call, and Handoff node execution
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import httpx


@dataclass
class WorkflowState:
    """Current workflow execution state"""
    current_node_id: str
    variables: Dict[str, Any]
    execution_history: List[str]
    user_input: Optional[str] = None


@dataclass
class NodeExecutionResult:
    """Result of executing a single node"""
    messages: List[str]
    next_node_id: Optional[str]
    variables: Optional[Dict[str, Any]] = None
    requires_input: bool = False
    is_complete: bool = False


class WorkflowExecutor:
    """
    Backend workflow executor for hybrid execution
    Executes backend-required nodes (AI Agent, API Call, Handoff)
    """
    
    def __init__(
        self,
        workflow_definition: Dict[str, Any],
        session_id: str,
        project_id: str,
        llm_service=None,
        kb_service=None
    ):
        self.workflow = workflow_definition
        self.session_id = session_id
        self.project_id = project_id
        self.llm_service = llm_service
        self.kb_service = kb_service
        self.state: Optional[WorkflowState] = None
    
    def load_state(self, state_dict: Dict[str, Any]):
        """Load execution state from frontend"""
        self.state = WorkflowState(
            current_node_id=state_dict.get('currentNodeId', ''),
            variables=state_dict.get('variables', {}),
            execution_history=state_dict.get('executionHistory', []),
            user_input=state_dict.get('userInput')
        )
    
    async def execute_current_node(self) -> NodeExecutionResult:
        """Execute the current node"""
        if not self.state:
            raise ValueError("State not loaded")
        
        # Find current node
        current_node = self._find_node(self.state.current_node_id)
        if not current_node:
            return NodeExecutionResult(
                messages=["Error: Invalid workflow state"],
                next_node_id=None,
                is_complete=True
            )
        
        # Execute based on node type
        node_type = current_node.get('type')
        
        if node_type == 'ai-agent':
            return await self._execute_ai_agent_node(current_node)
        elif node_type == 'api-call':
            return await self._execute_api_call_node(current_node)
        elif node_type == 'handoff':
            return await self._execute_handoff_node(current_node)
        else:
            # Shouldn't reach here in hybrid execution
            return NodeExecutionResult(
                messages=[],
                next_node_id=self._get_next_node_id(current_node),
                is_complete=False
            )
    
    async def process_user_input(self, user_input: str) -> NodeExecutionResult:
        """Process user input and execute workflow"""
        # Initialize state if not exists
        if not self.state:
            start_node = next((n for n in self.workflow['nodes'] if n['type'] == 'start'), None)
            if not start_node:
                return NodeExecutionResult(
                    messages=["Error: No start node found"],
                    next_node_id=None,
                    is_complete=True
                )
            
            self.state = WorkflowState(
                current_node_id=start_node['id'],
                variables=self.workflow.get('variables', {}),
                execution_history=[start_node['id']],
                user_input=user_input
            )
            
            # Move to next node after start
            next_id = self._get_next_node_id(start_node)
            if next_id:
                self.state.current_node_id = next_id
        else:
            self.state.user_input = user_input
        
        return await self.execute_current_node()
    
    async def _execute_ai_agent_node(self, node: Dict[str, Any]) -> NodeExecutionResult:
        """Execute AI Agent node"""
        try:
            # Get node configuration
            use_kb = node.get('data', {}).get('useKnowledgeBase', True)
            custom_prompt = node.get('data', {}).get('prompt', '')
            
            # Get context from knowledge base if enabled
            context = ""
            if use_kb and self.kb_service:
                context = await self.kb_service.get_relevant_context(
                    self.state.user_input or '',
                    self.project_id
                )
            
            # Generate response using LLM
            if self.llm_service:
                # Build prompt
                prompt = custom_prompt if custom_prompt else self.state.user_input or ''
                
                response = await self.llm_service.generate_response(
                    query=prompt,
                    context=context,
                    history=[],  # Could load from session
                    persona={}   # Could load from project config
                )
                
                messages = [response]
            else:
                messages = ["AI Agent: " + (self.state.user_input or "No input")]
            
            # Get next node
            next_node_id = self._get_next_node_id(node)
            
            return NodeExecutionResult(
                messages=messages,
                next_node_id=next_node_id,
                variables=self.state.variables,
                is_complete=not next_node_id
            )
            
        except Exception as e:
            print(f"Error executing AI Agent node: {e}")
            return NodeExecutionResult(
                messages=[f"Error: {str(e)}"],
                next_node_id=None,
                is_complete=True
            )
    
    async def _execute_api_call_node(self, node: Dict[str, Any]) -> NodeExecutionResult:
        """Execute API Call node"""
        try:
            # Get node configuration
            method = node.get('data', {}).get('method', 'GET')
            url = node.get('data', {}).get('url', '')
            headers = node.get('data', {}).get('headers', {})
            body = node.get('data', {}).get('body', '')
            response_var = node.get('data', {}).get('responseVariable', 'api_response')
            
            if not url:
                return NodeExecutionResult(
                    messages=["Error: No URL specified for API call"],
                    next_node_id=None,
                    is_complete=True
                )
            
            # Make API call
            async with httpx.AsyncClient() as client:
                if method == 'GET':
                    response = await client.get(url, headers=headers, timeout=10.0)
                elif method == 'POST':
                    response = await client.post(url, headers=headers, content=body, timeout=10.0)
                elif method == 'PUT':
                    response = await client.put(url, headers=headers, content=body, timeout=10.0)
                elif method == 'DELETE':
                    response = await client.delete(url, headers=headers, timeout=10.0)
                else:
                    raise ValueError(f"Unsupported method: {method}")
                
                # Store response in variables
                self.state.variables[response_var] = response.text
                
                # Get next node
                next_node_id = self._get_next_node_id(node)
                
                return NodeExecutionResult(
                    messages=[],  # API calls don't send messages to user
                    next_node_id=next_node_id,
                    variables=self.state.variables,
                    is_complete=not next_node_id
                )
                
        except Exception as e:
            print(f"Error executing API Call node: {e}")
            return NodeExecutionResult(
                messages=[f"API Error: {str(e)}"],
                next_node_id=None,
                is_complete=True
            )
    
    async def _execute_handoff_node(self, node: Dict[str, Any]) -> NodeExecutionResult:
        """Execute Handoff node"""
        target = node.get('data', {}).get('target', 'human')
        message = node.get('data', {}).get('message', 'Transferring to human agent...')
        
        # In a real implementation, this would trigger handoff logic
        # For now, just return a message
        return NodeExecutionResult(
            messages=[message],
            next_node_id=None,  # Handoff ends the workflow
            is_complete=True
        )
    
    def _find_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Find a node by ID"""
        return next((n for n in self.workflow['nodes'] if n['id'] == node_id), None)
    
    def _get_next_node_id(self, node: Dict[str, Any]) -> Optional[str]:
        """Get the next node ID from edges"""
        node_id = node['id']
        edge = next((e for e in self.workflow['edges'] if e['source'] == node_id), None)
        return edge['target'] if edge else None
    
    def get_state(self) -> Dict[str, Any]:
        """Get current state as dict"""
        if not self.state:
            return {}
        
        return {
            'currentNodeId': self.state.current_node_id,
            'variables': self.state.variables,
            'executionHistory': self.state.execution_history,
            'userInput': self.state.user_input
        }
