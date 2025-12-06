import {
    WorkflowDefinition,
    WorkflowNode,
    WorkflowEdge,
    WorkflowValidationResult,
    WorkflowValidationError,
} from './workflow-types';

/**
 * Validates a workflow definition for errors and warnings
 */
export function validateWorkflow(workflow: WorkflowDefinition): WorkflowValidationResult {
    const errors: WorkflowValidationError[] = [];

    // Check for start node
    const startNodes = workflow.nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
        errors.push({
            type: 'error',
            message: 'Workflow must have exactly one Start node',
        });
    } else if (startNodes.length > 1) {
        errors.push({
            type: 'error',
            message: 'Workflow can only have one Start node',
        });
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    workflow.edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
    });

    workflow.nodes.forEach(node => {
        if (node.type !== 'start' && !connectedNodeIds.has(node.id)) {
            errors.push({
                type: 'warning',
                message: `Node "${node.id}" is not connected to the workflow`,
                nodeId: node.id,
            });
        }
    });

    // Check for cycles (optional - workflows can have cycles for loops)
    // This is a warning, not an error
    const hasCycle = detectCycle(workflow);
    if (hasCycle) {
        errors.push({
            type: 'warning',
            message: 'Workflow contains a cycle. Make sure this is intentional.',
        });
    }

    // Validate node-specific requirements
    workflow.nodes.forEach(node => {
        switch (node.type) {
            case 'message':
                if (!node.data.message || node.data.message.trim() === '') {
                    errors.push({
                        type: 'error',
                        message: 'Message node must have a message',
                        nodeId: node.id,
                    });
                }
                break;
            case 'condition':
                if (!node.data.conditions || node.data.conditions.length === 0) {
                    errors.push({
                        type: 'error',
                        message: 'Condition node must have at least one condition',
                        nodeId: node.id,
                    });
                }
                break;
            case 'api-call':
                if (!node.data.url || node.data.url.trim() === '') {
                    errors.push({
                        type: 'error',
                        message: 'API Call node must have a URL',
                        nodeId: node.id,
                    });
                }
                break;
            case 'variable-set':
                if (!node.data.variableName || node.data.variableName.trim() === '') {
                    errors.push({
                        type: 'error',
                        message: 'Variable Set node must have a variable name',
                        nodeId: node.id,
                    });
                }
                break;
        }
    });

    return {
        valid: errors.filter(e => e.type === 'error').length === 0,
        errors,
    };
}

/**
 * Detects if there's a cycle in the workflow graph
 */
function detectCycle(workflow: WorkflowDefinition): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const adjacencyList = new Map<string, string[]>();
    workflow.edges.forEach(edge => {
        if (!adjacencyList.has(edge.source)) {
            adjacencyList.set(edge.source, []);
        }
        adjacencyList.get(edge.source)!.push(edge.target);
    });

    function dfs(nodeId: string): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = adjacencyList.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) return true;
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }

    for (const node of workflow.nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id)) return true;
        }
    }

    return false;
}

/**
 * Creates a default workflow for new projects
 */
export function createDefaultWorkflow(): WorkflowDefinition {
    return {
        nodes: [
            {
                id: 'start-1',
                type: 'start',
                position: { x: 250, y: 50 },
                data: {},
                executionLocation: 'frontend',
            },
            {
                id: 'input-1',
                type: 'input',
                position: { x: 250, y: 150 },
                data: {
                    prompt: 'How can I help you?',
                },
                executionLocation: 'frontend',
            },
            {
                id: 'ai-agent-1',
                type: 'ai-agent',
                position: { x: 250, y: 250 },
                data: {
                    useKnowledgeBase: true,
                },
                executionLocation: 'backend',
            },
            {
                id: 'end-1',
                type: 'end',
                position: { x: 250, y: 350 },
                data: {},
                executionLocation: 'frontend',
            },
        ],
        edges: [
            {
                id: 'e-start-input',
                source: 'start-1',
                target: 'input-1',
            },
            {
                id: 'e-input-ai',
                source: 'input-1',
                target: 'ai-agent-1',
            },
            {
                id: 'e-ai-end',
                source: 'ai-agent-1',
                target: 'end-1',
            },
        ],
        variables: {},
    };
}

/**
 * Validates if a URL is in the whitelist
 */
export function validateApiUrl(url: string, whitelist: string[]): boolean {
    if (!whitelist || whitelist.length === 0) {
        return false; // No whitelist = no API calls allowed
    }

    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        return whitelist.some(whitelistedDomain => {
            // Support wildcards
            if (whitelistedDomain.startsWith('*.')) {
                const baseDomain = whitelistedDomain.substring(2);
                return domain.endsWith(baseDomain);
            }
            return domain === whitelistedDomain;
        });
    } catch {
        return false; // Invalid URL
    }
}

/**
 * Gets the next node ID based on current node and execution result
 */
export function getNextNodeId(
    currentNode: WorkflowNode,
    edges: WorkflowEdge[],
    executionResult?: any
): string | null {
    // For condition nodes, use the execution result to determine next node
    if (currentNode.type === 'condition' && executionResult?.targetNodeId) {
        return executionResult.targetNodeId;
    }

    // For other nodes, find the first outgoing edge
    const outgoingEdge = edges.find(edge => edge.source === currentNode.id);
    return outgoingEdge?.target || null;
}
