"use client";

import { useCallback, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowDefinition, WorkflowNode, WorkflowEdge } from '@/lib/workflow-types';
import { validateWorkflow } from '@/lib/workflow-utils';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

// Import custom nodes (we'll create these next)
import StartNode from './workflow-nodes/StartNode';
import MessageNode from './workflow-nodes/MessageNode';
import UserInputNode from './workflow-nodes/UserInputNode';
import ConditionNode from './workflow-nodes/ConditionNode';
import AIAgentNode from './workflow-nodes/AIAgentNode';
import APICallNode from './workflow-nodes/APICallNode';
import VariableSetNode from './workflow-nodes/VariableSetNode';
import HandoffNode from './workflow-nodes/HandoffNode';
import EndNode from './workflow-nodes/EndNode';
import NodePalette from './workflow-nodes/NodePalette';

const nodeTypes = {
    start: StartNode,
    message: MessageNode,
    input: UserInputNode,
    condition: ConditionNode,
    'ai-agent': AIAgentNode,
    'api-call': APICallNode,
    'variable-set': VariableSetNode,
    handoff: HandoffNode,
    end: EndNode,
};

interface WorkflowEditorProps {
    workflow: WorkflowDefinition;
    onSave: (workflow: WorkflowDefinition) => void;
    onClose: () => void;
    apiWhitelist?: string[];
}

export default function WorkflowEditor({ workflow, onSave, onClose, apiWhitelist }: WorkflowEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(
        workflow.nodes.map(n => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: { ...n.data, executionLocation: n.executionLocation },
        }))
    );

    const [edges, setEdges, onEdgesChange] = useEdgesState(
        workflow.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            label: e.label,
        }))
    );

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const handleSave = () => {
        const workflowDef: WorkflowDefinition = {
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type as any,
                position: n.position,
                data: n.data,
                executionLocation: n.data.executionLocation,
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                label: e.label as string | undefined,
            })),
            variables: workflow.variables || {},
        };

        const validation = validateWorkflow(workflowDef);

        if (!validation.valid) {
            const errorMessages = validation.errors
                .filter(e => e.type === 'error')
                .map(e => e.message)
                .join('\n');

            if (!confirm(`Workflow has errors:\n\n${errorMessages}\n\nSave anyway?`)) {
                return;
            }
        }

        onSave(workflowDef);
        onClose();
    };

    const handleAddNode = (type: string) => {
        const newNode = {
            id: `${type}-${Date.now()}`,
            type: type as any,
            position: { x: 250, y: 100 + nodes.length * 50 },
            data: getDefaultNodeData(type),
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    };

    const handleNodeDataChange = (nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    const validation = validateWorkflow({
        nodes: nodes.map(n => ({
            id: n.id,
            type: n.type as any,
            position: n.position,
            data: n.data,
            executionLocation: n.data.executionLocation,
        })),
        edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            label: e.label as string | undefined,
        })),
        variables: {},
    });

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Workflow Editor
                    </h2>
                    {validation.valid ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Valid</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>{validation.errors.filter(e => e.type === 'error').length} errors</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                        <Save className="h-4 w-4" />
                        Save Workflow
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-3.5rem)]">
                {/* Node Palette */}
                <NodePalette onAddNode={handleAddNode} />

                {/* React Flow Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={handleNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        snapToGrid
                        snapGrid={[15, 15]}
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </div>

                {/* Node Properties Panel */}
                {selectedNode && (
                    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Node Properties
                                </h3>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Node ID
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedNode.id}
                                        disabled
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Node Type
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedNode.type}
                                        disabled
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                                    />
                                </div>

                                {/* Node-specific configuration will be handled by each node component */}
                                {/* Node Configuration Inputs */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase">Configuration</h4>

                                    {/* Message Node */}
                                    {selectedNode.type === 'message' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                            <textarea
                                                value={selectedNode.data.message as string || ''}
                                                onChange={(e) => handleNodeDataChange(selectedNode.id, { message: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                                                placeholder="Enter message text..."
                                            />
                                        </div>
                                    )}

                                    {/* User Input Node */}
                                    {selectedNode.type === 'input' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt</label>
                                            <input
                                                type="text"
                                                value={selectedNode.data.prompt as string || ''}
                                                onChange={(e) => handleNodeDataChange(selectedNode.id, { prompt: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="e.g. How can I help?"
                                            />
                                        </div>
                                    )}

                                    {/* AI Agent Node */}
                                    {selectedNode.type === 'ai-agent' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="useKB"
                                                    checked={selectedNode.data.useKnowledgeBase as boolean}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { useKnowledgeBase: e.target.checked })}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor="useKB" className="text-sm text-gray-700 dark:text-gray-300">Use Knowledge Base</label>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Prompt (Optional)</label>
                                                <textarea
                                                    value={selectedNode.data.prompt as string || ''}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { prompt: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                                                    placeholder="Override default agent behavior..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* API Call Node */}
                                    {selectedNode.type === 'api-call' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                                                <select
                                                    value={selectedNode.data.method as string}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { method: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                                >
                                                    <option value="GET">GET</option>
                                                    <option value="POST">POST</option>
                                                    <option value="PUT">PUT</option>
                                                    <option value="DELETE">DELETE</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                                                <input
                                                    type="text"
                                                    value={selectedNode.data.url as string || ''}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { url: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                                    placeholder="https://api.example.com..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Headers (JSON)</label>
                                                <input
                                                    type="text"
                                                    value={typeof selectedNode.data.headers === 'string' ? selectedNode.data.headers : JSON.stringify(selectedNode.data.headers || {})}
                                                    onChange={(e) => {
                                                        try {
                                                            const val = e.target.value;
                                                            // Store as string, parse on save if needed or keep flexible
                                                            handleNodeDataChange(selectedNode.id, { headers: val });
                                                        } catch (e) { }
                                                    }}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
                                                    placeholder="{}"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Response Variable</label>
                                                <input
                                                    type="text"
                                                    value={selectedNode.data.responseVariable as string || 'api_response'}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { responseVariable: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                                    placeholder="api_response"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Variable Set Node */}
                                    {selectedNode.type === 'variable-set' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Variable Name</label>
                                                <input
                                                    type="text"
                                                    value={selectedNode.data.variableName as string || ''}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { variableName: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                                    placeholder="my_var"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                                                <input
                                                    type="text"
                                                    value={selectedNode.data.value as string || ''}
                                                    onChange={(e) => handleNodeDataChange(selectedNode.id, { value: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                                    placeholder="some value"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Handoff Node */}
                                    {selectedNode.type === 'handoff' && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                                            <select
                                                value={selectedNode.data.target as string}
                                                onChange={(e) => handleNodeDataChange(selectedNode.id, { target: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                            >
                                                <option value="human">Human Agent</option>
                                                <option value="department">Department</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="pt-4 text-[10px] text-gray-400">
                                        Changes are applied immediately. Remember to save the workflow.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getDefaultNodeData(type: string): any {
    switch (type) {
        case 'start':
            return { executionLocation: 'frontend' };
        case 'message':
            return { message: 'Hello!', executionLocation: 'frontend' };
        case 'input':
            return { prompt: 'How can I help you?', executionLocation: 'frontend' };
        case 'condition':
            return { conditions: [], executionLocation: 'frontend' };
        case 'ai-agent':
            return { useKnowledgeBase: true, executionLocation: 'backend' };
        case 'api-call':
            return { method: 'GET', url: '', executionLocation: 'backend' };
        case 'variable-set':
            return { variableName: '', value: '', valueType: 'static', executionLocation: 'frontend' };
        case 'handoff':
            return { target: 'human', executionLocation: 'backend' };
        case 'end':
            return { executionLocation: 'frontend' };
        default:
            return {};
    }
}
