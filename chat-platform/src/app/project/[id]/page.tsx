"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";
import ConfigurationPanel from "@/components/editor/ConfigurationPanel";
import PreviewArea from "@/components/preview/PreviewArea";

export default function EditorPage({ params }: { params: { id: string } }) {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Chat Widget Editor
                    </h1>
                </div>
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
                <div className="w-[100px]"></div> {/* Spacer for balance */}
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Configuration */}
                <div className="w-[400px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
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
