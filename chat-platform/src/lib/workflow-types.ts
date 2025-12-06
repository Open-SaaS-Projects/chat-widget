/**
 * Workflow type definitions for custom chat workflows
 */

export type NodeType =
    | 'start'
    | 'message'
    | 'input'
    | 'condition'
    | 'ai-agent'
    | 'api-call'
    | 'variable-set'
    | 'handoff'
    | 'end';

export type ExecutionLocation = 'frontend' | 'backend';

export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: Record<string, any>; // Node-specific configuration
    executionLocation?: ExecutionLocation; // For hybrid execution
}

export interface WorkflowEdge {
    id: string;
    source: string; // Source node ID
    target: string; // Target node ID
    sourceHandle?: string; // For condition nodes with multiple outputs
    label?: string; // Edge label (e.g., "Yes", "No")
}

export interface WorkflowDefinition {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    variables: Record<string, any>; // Default workflow variables
}

export interface WorkflowValidationError {
    type: 'error' | 'warning';
    message: string;
    nodeId?: string;
}

export interface WorkflowValidationResult {
    valid: boolean;
    errors: WorkflowValidationError[];
}

// Execution state for hybrid execution
export interface WorkflowExecutionState {
    currentNodeId: string;
    variables: Record<string, any>;
    executionHistory: string[];
    userInput?: string;
}

export interface NodeExecutionResult {
    messages: string[];
    nextNodeId: string | null;
    variables?: Record<string, any>;
    requiresInput?: boolean;
    isComplete?: boolean;
}

// Node-specific data interfaces
export interface MessageNodeData {
    message: string;
}

export interface UserInputNodeData {
    prompt?: string;
    validation?: {
        required?: boolean;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
    };
}

export interface ConditionNodeData {
    conditions: {
        type: 'keyword' | 'regex' | 'variable' | 'custom';
        value: string;
        targetNodeId: string;
        label?: string;
    }[];
    defaultTargetNodeId?: string;
}

export interface AIAgentNodeData {
    prompt?: string;
    useKnowledgeBase?: boolean;
    temperature?: number;
}

export interface APICallNodeData {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: string;
    responseVariable?: string;
}

export interface VariableSetNodeData {
    variableName: string;
    value: string;
    valueType: 'static' | 'expression';
}

export interface HandoffNodeData {
    target: 'human' | 'workflow';
    targetId?: string;
    message?: string;
}
