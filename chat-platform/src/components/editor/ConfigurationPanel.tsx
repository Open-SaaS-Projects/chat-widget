"use client";

import { useState } from "react";
import { Paintbrush, Image as ImageIcon, Type, Settings, Code, Globe } from "lucide-react";
import StylePanel from "./panels/StylePanel";
import BrandingPanel from "./panels/BrandingPanel";
import ContentPanel from "./panels/ContentPanel";
import SettingsPanel from "./panels/SettingsPanel";
import EmbedPanel from "./panels/EmbedPanel";
import WebsitePanel from "./panels/WebsitePanel";

type Tab = "style" | "branding" | "content" | "settings" | "website" | "embed";

export default function ConfigurationPanel() {
    const [activeTab, setActiveTab] = useState<Tab>("style");

    const tabs = [
        { id: "style", label: "Style", icon: Paintbrush },
        { id: "branding", label: "Branding", icon: ImageIcon },
        { id: "content", label: "Content", icon: Type },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "website", label: "Website", icon: Globe },
        { id: "embed", label: "Embed", icon: Code },
    ] as const;

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-primary text-primary bg-white dark:bg-gray-800"
                                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                }`}
                        >
                            <Icon className="h-5 w-5 mb-1" />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "style" && <StylePanel />}
                {activeTab === "branding" && <BrandingPanel />}
                {activeTab === "content" && <ContentPanel />}
                {activeTab === "settings" && <SettingsPanel />}
                {activeTab === "website" && <WebsitePanel />}
                {activeTab === "embed" && <EmbedPanel />}
            </div>
        </div>
    );
}
