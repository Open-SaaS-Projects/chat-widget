import {
    WorkflowDefinition,
    WorkflowNode,
    WorkflowEdge,
    WorkflowExecutionState,
    NodeExecutionResult,
} from './workflow-types';
import { getNextNodeId } from './workflow-utils';

/**
 * Frontend workflow executor for hybrid execution
 * Executes frontend-compatible nodes and delegates to backend when needed
 */
export class WorkflowExecutor {
    private workflow: WorkflowDefinition;
    private state: WorkflowExecutionState;
    private projectId: string;
    private sessionId: string;

    constructor(
        workflow: WorkflowDefinition,
        projectId: string,
        sessionId: string = 'default'
    ) {
        this.workflow = workflow;
        this.projectId = projectId;
        this.sessionId = sessionId;

        // Initialize state with start node
        const startNode = workflow.nodes.find(n => n.type === 'start');
        this.state = {
            currentNodeId: startNode?.id || '',
            variables: { ...workflow.variables },
            executionHistory: [],
            userInput: undefined,
        };
    }

    /**
     * Start workflow execution
     */
    async start(): Promise<NodeExecutionResult> {
        const startNode = this.workflow.nodes.find(n => n.type === 'start');
        if (!startNode) {
            throw new Error('Workflow must have a start node');
        }

        this.state.currentNodeId = startNode.id;
        this.state.executionHistory.push(startNode.id);

        // Move to next node after start
        const nextNodeId = getNextNodeId(startNode, this.workflow.edges);
        if (!nextNodeId) {
            return {
                messages: [],
                nextNodeId: null,
                isComplete: true,
            };
        }

        this.state.currentNodeId = nextNodeId;
        return this.executeCurrentNode();
    }

    /**
     * Process user input and continue execution
     */
    async processUserInput(input: string): Promise<NodeExecutionResult> {
        this.state.userInput = input;
        return this.executeCurrentNode();
    }

    /**
     * Execute the current node
     */
    private async executeCurrentNode(): Promise<NodeExecutionResult> {
        const currentNode = this.workflow.nodes.find(n => n.id === this.state.currentNodeId);
        if (!currentNode) {
            return {
                messages: ['Error: Invalid workflow state'],
                nextNodeId: null,
                isComplete: true,
            };
        }

        this.state.executionHistory.push(currentNode.id);

        // Check if node requires backend execution
        if (this.requiresBackendExecution(currentNode)) {
            return this.executeOnBackend(currentNode);
        }

        // Execute on frontend
        return this.executeNodeFrontend(currentNode);
    }

    /**
     * Check if node requires backend execution
     */
    private requiresBackendExecution(node: WorkflowNode): boolean {
        return ['ai-agent', 'api-call', 'handoff'].includes(node.type);
    }

    /**
     * Execute node on backend (hybrid execution)
     */
    private async executeOnBackend(node: WorkflowNode): Promise<NodeExecutionResult> {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: this.state.userInput || '',
                    project_id: this.projectId,
                    session_id: this.sessionId,
                    workflow_state: {
                        currentNodeId: node.id,
                        variables: this.state.variables,
                        executionHistory: this.state.executionHistory,
                    },
                }),
            });

            const data = await response.json();

            // Update state with backend result
            if (data.node_result) {
                const result = data.node_result;
                this.state.variables = { ...this.state.variables, ...result.variables };
                this.state.currentNodeId = result.nextNodeId || '';

                return {
                    messages: result.messages || [data.response],
                    nextNodeId: result.nextNodeId,
                    variables: this.state.variables,
                    isComplete: !result.nextNodeId,
                };
            }

            return {
                messages: [data.response || 'No response'],
                nextNodeId: null,
                isComplete: true,
            };
        } catch (error) {
            console.error('Backend execution error:', error);
            return {
                messages: ['Error executing workflow'],
                nextNodeId: null,
                isComplete: true,
            };
        }
    }

    /**
     * Execute node on frontend
     */
    private async executeNodeFrontend(node: WorkflowNode): Promise<NodeExecutionResult> {
        switch (node.type) {
            case 'message':
                return this.executeMessageNode(node);
            case 'input':
                return this.executeInputNode(node);
            case 'condition':
                return this.executeConditionNode(node);
            case 'variable-set':
                return this.executeVariableSetNode(node);
            case 'end':
                return this.executeEndNode(node);
            default:
                const nextNodeId = getNextNodeId(node, this.workflow.edges);
                return {
                    messages: [],
                    nextNodeId,
                    isComplete: !nextNodeId,
                };
        }
    }

    /**
     * Execute message node
     */
    private executeMessageNode(node: WorkflowNode): NodeExecutionResult {
        const message = node.data.message || 'No message';
        const nextNodeId = getNextNodeId(node, this.workflow.edges);

        return {
            messages: [message],
            nextNodeId,
            isComplete: !nextNodeId,
        };
    }

    /**
     * Execute input node
     */
    private executeInputNode(node: WorkflowNode): NodeExecutionResult {
        // Input node waits for user input
        if (!this.state.userInput) {
            return {
                messages: [node.data.prompt || 'Please enter your message'],
                nextNodeId: node.id, // Stay on this node
                requiresInput: true,
                isComplete: false,
            };
        }

        // User provided input, move to next node
        const nextNodeId = getNextNodeId(node, this.workflow.edges);
        return {
            messages: [],
            nextNodeId,
            isComplete: !nextNodeId,
        };
    }

    /**
     * Execute condition node
     */
    private executeConditionNode(node: WorkflowNode): NodeExecutionResult {
        const conditions = node.data.conditions || [];
        const input = this.state.userInput || '';

        // Evaluate conditions
        for (const condition of conditions) {
            if (this.evaluateCondition(condition, input)) {
                return {
                    messages: [],
                    nextNodeId: condition.targetNodeId,
                    isComplete: !condition.targetNodeId,
                };
            }
        }

        // No condition matched, use default
        const defaultTarget = node.data.defaultTargetNodeId;
        return {
            messages: [],
            nextNodeId: defaultTarget || null,
            isComplete: !defaultTarget,
        };
    }

    /**
     * Evaluate a condition
     */
    private evaluateCondition(condition: any, input: string): boolean {
        switch (condition.type) {
            case 'keyword':
                return input.toLowerCase().includes(condition.value.toLowerCase());
            case 'regex':
                try {
                    const regex = new RegExp(condition.value, 'i');
                    return regex.test(input);
                } catch {
                    return false;
                }
            case 'variable':
                return this.state.variables[condition.value] === true;
            default:
                return false;
        }
    }

    /**
     * Execute variable set node
     */
    private executeVariableSetNode(node: WorkflowNode): NodeExecutionResult {
        const { variableName, value, valueType } = node.data;

        if (variableName) {
            if (valueType === 'static') {
                this.state.variables[variableName] = value;
            } else {
                // Expression evaluation (simple version)
                this.state.variables[variableName] = this.evaluateExpression(value);
            }
        }

        const nextNodeId = getNextNodeId(node, this.workflow.edges);
        return {
            messages: [],
            nextNodeId,
            variables: this.state.variables,
            isComplete: !nextNodeId,
        };
    }

    /**
     * Execute end node
     */
    private executeEndNode(node: WorkflowNode): NodeExecutionResult {
        return {
            messages: [],
            nextNodeId: null,
            isComplete: true,
        };
    }

    /**
     * Simple expression evaluator
     */
    private evaluateExpression(expr: string): any {
        // Very basic - just return the expression for now
        // In production, use a safe expression evaluator
        return expr;
    }

    /**
     * Get current state
     */
    getState(): WorkflowExecutionState {
        return { ...this.state };
    }
}
