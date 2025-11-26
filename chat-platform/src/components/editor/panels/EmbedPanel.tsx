"use client";

import { useWidget } from "@/context/WidgetContext";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function EmbedPanel() {
    const { config } = useWidget();
    const [copied, setCopied] = useState(false);

    // Mock Project ID - in a real app this would come from the project data
    const projectId = "proj_" + Math.random().toString(36).substr(2, 9);
    const apiUrl = "https://api.your-saas.com";
    const cdnUrl = "https://cdn.your-saas.com/widget.js";

    const embedCode = `<!-- Chat Widget Embed Code -->
<your-chat-widget
  project-id="${projectId}"
  api-url="${apiUrl}"
  position="${config.position}"
  primary-color="${config.colors.primary}"
></your-chat-widget>

<script src="${cdnUrl}" defer></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Integration Code
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Copy and paste this code into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag.
                </p>

                <div className="relative group">
                    <div className="absolute right-2 top-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-gray-700">
                        {embedCode}
                    </pre>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Note
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        The widget will automatically inherit your website's fonts. Make sure to whitelist your domain in the project settings to prevent unauthorized usage.
                    </p>
                </div>
            </div>
        </div>
    );
}
