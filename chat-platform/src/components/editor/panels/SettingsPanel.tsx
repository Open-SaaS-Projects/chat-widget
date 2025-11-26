"use client";

import { useWidget } from "@/context/WidgetContext";
import { AlignLeft, AlignRight } from "lucide-react";

export default function SettingsPanel() {
    const { config, updateConfig } = useWidget();

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Position
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => updateConfig({ position: "left" })}
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${config.position === "left"
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400"
                            }`}
                    >
                        <AlignLeft className="h-6 w-6" />
                        <span className="text-sm font-medium">Left</span>
                    </button>
                    <button
                        onClick={() => updateConfig({ position: "right" })}
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${config.position === "right"
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400"
                            }`}
                    >
                        <AlignRight className="h-6 w-6" />
                        <span className="text-sm font-medium">Right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
