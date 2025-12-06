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
        const newNode: Node = {
            id: `${type}-${Date.now()}`,
            type,
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
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Double-click the node to edit its properties
                                    </p>
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
