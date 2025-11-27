"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Save, Check, Brain } from "lucide-react";
import ConfigurationPanel from "@/components/editor/ConfigurationPanel";
import PreviewArea from "@/components/preview/PreviewArea";
import { useWidget } from "@/context/WidgetContext";
import Logo from "@/components/ui/Logo";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const { loadProject, saveProject, hasUnsavedChanges, projectName } = useWidget();
    const [showSaved, setShowSaved] = useState(false);

    // Unwrap params Promise for Next.js 15
    const { id } = use(params);

    useEffect(() => {
        // Load project configuration
        loadProject(id);
    }, [id, loadProject]);

    const handleSave = () => {
        saveProject();
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Logo />
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {projectName}
                        </h1>
                        {hasUnsavedChanges && (
                            <p className="text-xs text-gray-500">Unsaved changes</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setDevice("desktop")}
                            className={`p-2 rounded-md transition-all ${device === "desktop"
                                ? "bg-white dark:bg-gray-600 shadow-sm text-primary"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <Monitor className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setDevice("mobile")}
                            className={`p-2 rounded-md transition-all ${device === "mobile"
                                ? "bg-white dark:bg-gray-600 shadow-sm text-primary"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <Smartphone className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${hasUnsavedChanges
                            ? "bg-[#6320CE] text-white hover:bg-[#7B3FE4] shadow-lg shadow-[#6320CE]/25"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {showSaved ? (
                            <>
                                <Check className="h-4 w-4" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Configuration */}
                <div className="w-[500px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <ConfigurationPanel />
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center p-8">
                    <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
                    <PreviewArea device={device} />
                </div>
            </div>
        </div>
    );
}
