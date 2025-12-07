from litellm import completion
import os
import json
from typing import List, Dict, Any, AsyncGenerator, Optional
from services.persona_builder import PersonaBuilder
from services.tools_service import ToolsService

# Configure LiteLLM
os.environ["GEMINI_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")
MODEL_NAME = os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")

class LLMService:
    def __init__(self, tools_service: Optional[ToolsService] = None):
        self.tools_service = tools_service

    def _construct_system_prompt(self, context_chunks: List[Dict[str, Any]], persona_config: Dict[str, str] = None) -> str:
        """
        Construct the system prompt with retrieved context and persona settings.
        """
        if not persona_config:
            persona_config = {}
            
        base_prompt = PersonaBuilder.build_system_prompt(
            tone=persona_config.get("tone", "friendly"),
            agent_type=persona_config.get("agentType", "general"),
            response_length=persona_config.get("responseLength", "medium"),
            custom_instructions=persona_config.get("customInstructions", "")
        )
        
        print(f"🤖 Generated System Prompt:\n{base_prompt}")
        
        context_text = "\n\n".join([f"- {chunk['content']}" for chunk in context_chunks])
        
        # Get response length instruction for final reminder
        length_reminder = PersonaBuilder.RESPONSE_LENGTH_INSTRUCTIONS.get(
            persona_config.get("responseLength", "medium"),
            PersonaBuilder.RESPONSE_LENGTH_INSTRUCTIONS["medium"]
        )
        
        return f"{base_prompt}\n### Training Data Context:\n{context_text}\n\n=== CRITICAL FINAL INSTRUCTION ===\n{length_reminder}\n\nREMINDER: You MUST stay in character as defined by your Role and Tone above."

    async def generate_response(self, query: str, context_chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = [], persona_config: Dict[str, str] = None, project_id: str = None) -> str:
        """
        Generate a response using LiteLLM (Gemini) with support for Tool Usage.
        """
        system_prompt = self._construct_system_prompt(context_chunks, persona_config)
        
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-10:])
        messages.append({"role": "user", "content": query})

        # Get tools if available
        tools = []
        if self.tools_service and project_id:
            tools = self.tools_service.get_tools_for_llm(project_id)

        try:
            # First LLM Call
            response = completion(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
                tools=tools if tools else None,
                tool_choice="auto" if tools else None
            )
            
            response_msg = response.choices[0].message
            
            # Check for Tool Calls
            if hasattr(response_msg, 'tool_calls') and response_msg.tool_calls:
                # Add assistant's tool call message to history
                messages.append(response_msg)
                
                print(f"🛠️ LLM Requested Tools: {len(response_msg.tool_calls)}")
                
                # Execute each tool
                for tool_call in response_msg.tool_calls:
                    function_name = tool_call.function.name
                    try:
                        function_args = json.loads(tool_call.function.arguments)
                        
                        # Execute logic
                        tool_result = await self.tools_service.execute_tool_call(
                            project_id, function_name, function_args
                        )
                        
                        # Append result message
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(tool_result)
                        })
                        
                    except Exception as e:
                        print(f"Error executing tool {function_name}: {e}")
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps({"error": str(e)})
                        })

                # Second LLM Call (with tool results)
                second_response = completion(
                    model=MODEL_NAME,
                    messages=messages,
                    temperature=0.7
                )
                return second_response.choices[0].message.content

            return response_msg.content
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I'm having trouble processing your request right now."

    async def generate_stream_response(self, query: str, context_chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = [], persona_config: Dict[str, str] = None, project_id: str = None) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response using LiteLLM.
        Note: Simple streaming implementation for now. Tool usage in streaming requires complex frontend handling.
        For MVP, if we detect tools, we might fallback to non-streaming or handle it internally.
        """
        # For MVP: If tools are enabled, we do non-streaming logic first, then stream the final answer
        # This avoids complex client-side protocol changes
        if self.tools_service and project_id and self.tools_service.get_actions(project_id):
             # Use generate_response logic to handle tools synchronously
             full_response = await self.generate_response(query, context_chunks, history, persona_config, project_id)
             yield full_response
             return

        # Original Streaming Logic (No Tools)
        system_prompt = self._construct_system_prompt(context_chunks, persona_config)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-10:])
        messages.append({"role": "user", "content": query})

        try:
            response = completion(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
                stream=True
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"Error generating stream: {e}")
            yield "I apologize, but I'm having trouble processing your request right now."
