"use client";

import { useState } from "react";
import { Paintbrush, Image as ImageIcon, Type, Settings, Code, Globe, Brain, MessageSquare } from "lucide-react";
import StylePanel from "./panels/StylePanel";
import BrandingPanel from "./panels/BrandingPanel";
import ContentPanel from "./panels/ContentPanel";
import SettingsPanel from "./panels/SettingsPanel";
import EmbedPanel from "./panels/EmbedPanel";
import WebsitePanel from "./panels/WebsitePanel";
import BrainPanel from "./panels/BrainPanel";

type Mode = "widget" | "brain";
type WidgetTab = "style" | "branding" | "content" | "settings" | "website" | "embed";

export default function ConfigurationPanel() {
    const [activeMode, setActiveMode] = useState<Mode>("widget");
    const [activeWidgetTab, setActiveWidgetTab] = useState<WidgetTab>("style");

    const widgetTabs = [
        { id: "style", label: "Style", icon: Paintbrush },
        { id: "branding", label: "Branding", icon: ImageIcon },
        { id: "content", label: "Content", icon: Type },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "website", label: "Website", icon: Globe },
        { id: "embed", label: "Embed", icon: Code },
    ] as const;

    return (
        <div className="flex h-full bg-white dark:bg-gray-800">
            {/* Left Rail - Main Mode Switcher */}
            <div className="w-16 flex-shrink-0 flex flex-col items-center py-6 gap-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                    onClick={() => setActiveMode("widget")}
                    className={`p-3 rounded-xl transition-all group relative ${activeMode === "widget"
                        ? "bg-white dark:bg-gray-800 text-primary shadow-md"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                        }`}
                    title="Widget Customization"
                >
                    <MessageSquare className="h-6 w-6" />
                    {activeMode === "widget" && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full -ml-4" />
                    )}
                </button>

                <button
                    onClick={() => setActiveMode("brain")}
                    className={`p-3 rounded-xl transition-all group relative ${activeMode === "brain"
                        ? "bg-white dark:bg-gray-800 text-primary shadow-md"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                        }`}
                    title="Brain & Intelligence"
                >
                    <Brain className="h-6 w-6" />
                    {activeMode === "brain" && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full -ml-4" />
                    )}
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
                            {activeWidgetTab === "style" && <StylePanel />}
                            {activeWidgetTab === "branding" && <BrandingPanel />}
                            {activeWidgetTab === "content" && <ContentPanel />}
                            {activeWidgetTab === "settings" && <SettingsPanel />}
                            {activeWidgetTab === "website" && <WebsitePanel />}
                            {activeWidgetTab === "embed" && <EmbedPanel />}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <BrainPanel />
                    </div>
                )}
            </div>
        </div>
    );
}
