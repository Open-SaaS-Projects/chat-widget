"use client";

import { useState } from "react";
import { useWidget } from "@/context/WidgetContext";
import { Workflow, Plus, Settings, AlertCircle, CheckCircle2 } from "lucide-react";
import { createDefaultWorkflow, validateWorkflow } from "@/lib/workflow-utils";
import WorkflowEditor from "../WorkflowEditor";

export default function WorkflowPanel() {
    const { config, updateWorkflow, updateApiWhitelist } = useWidget();
    const [showWhitelistEditor, setShowWhitelistEditor] = useState(false);
    const [whitelistInput, setWhitelistInput] = useState("");
    const [showEditor, setShowEditor] = useState(false);

    const hasWorkflow = !!config.workflow;
    const validation = hasWorkflow ? validateWorkflow(config.workflow!) : null;

    const handleCreateWorkflow = () => {
        const defaultWorkflow = createDefaultWorkflow();
        updateWorkflow(defaultWorkflow);
        setShowEditor(true);
    };

    const handleDisableWorkflow = () => {
        if (confirm("Are you sure you want to disable the custom workflow? The widget will revert to default AI chat behavior.")) {
            updateWorkflow(undefined);
        }
    };

    const handleAddDomain = () => {
        if (!whitelistInput.trim()) return;

        const currentWhitelist = config.apiWhitelist || [];
        const newDomain = whitelistInput.trim();

        if (!currentWhitelist.includes(newDomain)) {
            updateApiWhitelist([...currentWhitelist, newDomain]);
        }

        setWhitelistInput("");
    };

    const handleRemoveDomain = (domain: string) => {
        const currentWhitelist = config.apiWhitelist || [];
        updateApiWhitelist(currentWhitelist.filter(d => d !== domain));
    };

    const handleSaveWorkflow = (workflow: any) => {
        updateWorkflow(workflow);
    };

    return (
        <>
            {showEditor && hasWorkflow && (
                <WorkflowEditor
                    workflow={config.workflow!}
                    onSave={handleSaveWorkflow}
                    onClose={() => setShowEditor(false)}
                    apiWhitelist={config.apiWhitelist}
                />
            )}

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Workflow className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Chat Workflow
                        </h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create custom conversation flows with visual node-based editor
                    </p>
                </div>

                {!hasWorkflow ? (
                    /* No Workflow State */
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                What are Chat Workflows?
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                Chat workflows allow you to create custom conversation flows with:
                            </p>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                                <li>Conditional branching based on user input</li>
                                <li>Custom messages and prompts</li>
                                <li>AI agent integration with knowledge base</li>
                                <li>External API calls</li>
                                <li>Variable storage and handoffs</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleCreateWorkflow}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Workflow
                        </button>

                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                <strong>Note:</strong> Without a workflow, your widget will use the default AI chat behavior (LLM + knowledge base). Workflows are completely optional.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Has Workflow State */
                    <div className="space-y-6">
                        {/* Workflow Status */}
                        <div className={`border rounded-lg p-4 ${validation?.valid
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                            }`}>
                            <div className="flex items-start gap-3">
                                {validation?.valid ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`text-sm font-medium mb-1 ${validation?.valid
                                            ? "text-green-900 dark:text-green-100"
                                            : "text-yellow-900 dark:text-yellow-100"
                                        }`}>
                                        {validation?.valid ? "Workflow Valid" : "Workflow Has Issues"}
                                    </h3>
                                    <p className={`text-xs ${validation?.valid
                                            ? "text-green-800 dark:text-green-200"
                                            : "text-yellow-800 dark:text-yellow-200"
                                        }`}>
                                        {config.workflow!.nodes.length} nodes, {config.workflow!.edges.length} connections
                                    </p>
                                    {validation && validation.errors.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {validation.errors.map((error, idx) => (
                                                <li key={idx} className="text-xs text-yellow-800 dark:text-yellow-200">
                                                    • {error.message}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Open Editor Button */}
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            onClick={() => setShowEditor(true)}
                        >
                            <Workflow className="h-4 w-4" />
                            Open Workflow Editor
                        </button>

                        {/* API Whitelist Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    API Whitelist
                                </h3>
                                <button
                                    onClick={() => setShowWhitelistEditor(!showWhitelistEditor)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showWhitelistEditor ? "Hide" : "Manage"}
                                </button>
                            </div>

                            {showWhitelistEditor && (
                                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Only API calls to whitelisted domains will be allowed in your workflow.
                                    </p>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={whitelistInput}
                                            onChange={(e) => setWhitelistInput(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleAddDomain()}
                                            placeholder="example.com or *.example.com"
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <button
                                            onClick={handleAddDomain}
                                            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {config.apiWhitelist && config.apiWhitelist.length > 0 ? (
                                        <div className="space-y-2">
                                            {config.apiWhitelist.map((domain, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                >
                                                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                                                        {domain}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveDomain(domain)}
                                                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                            No domains whitelisted. API Call nodes will be disabled.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Disable Workflow */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleDisableWorkflow}
                                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Disable Workflow
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
