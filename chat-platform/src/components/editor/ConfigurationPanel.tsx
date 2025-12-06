"use client";

import { useState } from "react";
import { Paintbrush, Image as ImageIcon, Type, Settings, Code, Globe, Brain, MessageSquare, Rocket, Workflow } from "lucide-react";
import StylePanel from "./panels/StylePanel";
import BrandingPanel from "./panels/BrandingPanel";
import ContentPanel from "./panels/ContentPanel";
import SettingsPanel from "./panels/SettingsPanel";
import EmbedPanel from "./panels/EmbedPanel";
import WebsitePanel from "./panels/WebsitePanel";
import BrainPanel from "./panels/BrainPanel";
import WorkflowPanel from "./panels/WorkflowPanel";

type Mode = "widget" | "brain" | "workflow" | "deployment";
type WidgetTab = "style" | "content" | "website";

export default function ConfigurationPanel() {
    const [activeMode, setActiveMode] = useState<Mode>("widget");
    const [activeWidgetTab, setActiveWidgetTab] = useState<WidgetTab>("style");

    const widgetTabs = [
        { id: "style", label: "Style", icon: Paintbrush },
        { id: "content", label: "Content", icon: Type },
        { id: "website", label: "Website", icon: Globe },
    ] as const;

    return (
        <div className="flex h-full bg-white dark:bg-gray-800">
            {/* Left Rail - Main Mode Switcher */}
            <div className="w-64 flex-shrink-0 flex flex-col py-6 px-3 gap-2 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="px-3 mb-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Menu
                    </h2>
                </div>

                <button
                    onClick={() => setActiveMode("widget")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${activeMode === "widget"
                        ? "bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">Widget Editor</span>
                </button>

                <button
                    onClick={() => setActiveMode("brain")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${activeMode === "brain"
                        ? "bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    <Brain className="h-4 w-4" />
                    <span className="text-sm font-medium">Knowledge Base</span>
                </button>

                <button
                    onClick={() => setActiveMode("workflow")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${activeMode === "workflow"
                        ? "bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    <Workflow className="h-4 w-4" />
                    <span className="text-sm font-medium">Chat Workflow</span>
                </button>

                <button
                    onClick={() => setActiveMode("deployment")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${activeMode === "deployment"
                        ? "bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    <Rocket className="h-4 w-4" />
                    <span className="text-sm font-medium">Deployment</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {activeMode === "widget" ? (
                    <>
                        {/* Widget Sub-Navigation */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto scrollbar-hide">
                            {widgetTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveWidgetTab(tab.id as WidgetTab)}
                                        className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-3 px-1 border-b-2 transition-colors ${activeWidgetTab === tab.id
                                            ? "border-primary text-primary"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 mb-1" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Widget Panels */}
                        <div className="flex-1 overflow-y-auto">
                            {activeWidgetTab === "style" && (
                                <div className="space-y-8 p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                            <Paintbrush className="h-4 w-4 text-primary" />
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                Appearance
                                            </h3>
                                        </div>
                                        <StylePanel />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                Branding
                                            </h3>
                                        </div>
                                        <BrandingPanel />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                            <Settings className="h-4 w-4 text-primary" />
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                Settings
                                            </h3>
                                        </div>
                                        <SettingsPanel />
                                    </div>
                                </div>
                            )}
                            {activeWidgetTab === "content" && <ContentPanel />}
                            {activeWidgetTab === "website" && <WebsitePanel />}
                        </div>
                    </>
                ) : activeMode === "brain" ? (
                    <div className="flex-1 overflow-y-auto">
                        <BrainPanel />
                    </div>
                ) : activeMode === "workflow" ? (
                    <div className="flex-1 overflow-y-auto">
                        <WorkflowPanel />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <EmbedPanel />
                    </div>
                )}
            </div>
        </div>
    );
}
