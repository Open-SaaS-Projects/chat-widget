"use client";

import { useWidget } from "@/context/WidgetContext";

export default function ContentPanel() {
    const { config, updateText } = useWidget();

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Text Content
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Header Title
                        </label>
                        <input
                            type="text"
                            value={config.text.headerTitle}
                            onChange={(e) => updateText({ headerTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                            placeholder="e.g. Chat Support"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Welcome Message
                        </label>
                        <textarea
                            value={config.text.welcomeMessage}
                            onChange={(e) => updateText({ welcomeMessage: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm resize-none"
                            placeholder="e.g. Hi! How can we help?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Input Placeholder
                        </label>
                        <input
                            type="text"
                            value={config.text.placeholder}
                            onChange={(e) => updateText({ placeholder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                            placeholder="e.g. Type a message..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
