"use client";

import {
    Play,
    MessageSquare,
    Keyboard,
    GitBranch,
    Brain,
    Globe,
    Variable,
    UserPlus,
    StopCircle,
} from 'lucide-react';

interface NodePaletteProps {
    onAddNode: (type: string) => void;
}

const nodeDefinitions = [
    { type: 'start', label: 'Start', icon: Play, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', description: 'Entry point' },
    { type: 'message', label: 'Message', icon: MessageSquare, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', description: 'Send message' },
    { type: 'input', label: 'User Input', icon: Keyboard, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', description: 'Capture input' },
    { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', description: 'Branch logic' },
    { type: 'ai-agent', label: 'AI Agent', icon: Brain, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', description: 'Call LLM' },
    { type: 'api-call', label: 'API Call', icon: Globe, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300', description: 'External API' },
    { type: 'variable-set', label: 'Set Variable', icon: Variable, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300', description: 'Store value' },
    { type: 'handoff', label: 'Handoff', icon: UserPlus, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', description: 'Transfer' },
    { type: 'end', label: 'End', icon: StopCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', description: 'Terminate' },
];

export default function NodePalette({ onAddNode }: NodePaletteProps) {
    return (
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Node Palette
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                        Click to add nodes to your workflow
                    </p>
                </div>

                <div className="space-y-2">
                    {nodeDefinitions.map((node) => {
                        const Icon = node.icon;
                        return (
                            <button
                                key={node.type}
                                onClick={() => onAddNode(node.type)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:scale-105 transition-all group"
                            >
                                <div className={`p-2 rounded-lg ${node.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {node.label}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {node.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            <strong>Tip:</strong> Connect nodes by dragging from the output handle (right) to the input handle (left) of another node.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
