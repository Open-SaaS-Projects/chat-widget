"use client";

import { useWidget } from "@/context/WidgetContext";
import { Globe } from "lucide-react";

export default function WebsitePanel() {
    const { config, updateConfig } = useWidget();

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Website Preview
                </h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Your Website URL
                    </label>
                    <input
                        type="url"
                        value={config.websiteUrl}
                        onChange={(e) => updateConfig({ websiteUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                        placeholder="https://example.com"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter your website URL to see how the chat widget will look on your actual site.
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                        Note
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        Some websites may not allow embedding due to security policies (X-Frame-Options). If your site doesn't load, this is normal and won't affect the actual widget installation.
                    </p>
                </div>
            </div>
        </div>
    );
}
