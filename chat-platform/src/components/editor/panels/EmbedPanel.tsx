"use client";

import { useWidget } from "@/context/WidgetContext";
import { Copy, Check, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function EmbedPanel() {
    const { config, projectId, updateConfig } = useWidget();
    const [copied, setCopied] = useState(false);
    const [allowedDomain, setAllowedDomain] = useState(config.websiteUrl || "");
    const [domainError, setDomainError] = useState("");

    // Use real project ID from context
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const apiUrl = isDevelopment ? "http://localhost:3000" : "https://makkn.com";
    const widgetUrl = isDevelopment ? "http://localhost:3000/widget/widget.js" : "https://makkn.com/widget/widget.js";

    // Don't show code until project ID is loaded
    if (!projectId) {
        return (
            <div className="space-y-6 p-4">
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading project...</p>
                </div>
            </div>
        );
    }

    const embedCode = `<!-- Chat Widget Embed Code -->
<your-chat-widget
  project-id="${projectId}"
  api-url="${apiUrl}"
  position="${config.position}"
  primary-color="${config.colors.primary}"
></your-chat-widget>

<script src="${widgetUrl}" defer></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const validateDomain = (domain: string): boolean => {
        if (!domain) {
            setDomainError("Domain is required");
            return false;
        }

        try {
            // Check if it's a valid URL
            const url = new URL(domain);

            // Must be http or https
            if (!['http:', 'https:'].includes(url.protocol)) {
                setDomainError("Domain must use http:// or https://");
                return false;
            }

            setDomainError("");
            return true;
        } catch (error) {
            setDomainError("Please enter a valid URL (e.g., https://example.com)");
            return false;
        }
    };

    const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAllowedDomain(value);

        if (value) {
            validateDomain(value);
        } else {
            setDomainError("");
        }
    };

    const handleSaveDomain = () => {
        if (validateDomain(allowedDomain)) {
            updateConfig({ websiteUrl: allowedDomain });
        }
    };

    return (
        <div className="space-y-6 p-4">
            {/* Domain Restriction Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Domain Restriction
                    </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Specify the domain where this chat widget is allowed to run. This prevents unauthorized use on other websites.
                </p>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Allowed Domain *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={allowedDomain}
                                onChange={handleDomainChange}
                                onBlur={handleSaveDomain}
                                placeholder="https://example.com"
                                className={`flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent ${domainError
                                        ? 'border-red-500 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            />
                        </div>
                        {domainError && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                <span>{domainError}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Examples:</strong>
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://example.com</code> - Exact domain</li>
                            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://*.example.com</code> - All subdomains</li>
                        </ul>
                    </div>

                    {config.websiteUrl && (
                        <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-green-900 dark:text-green-100">
                                    Domain Configured
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    Widget will only work on: <code className="font-mono">{config.websiteUrl}</code>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Integration Code Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                        Security Note
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        {config.websiteUrl
                            ? "Your widget is protected and will only work on the configured domain above."
                            : "⚠️ Configure an allowed domain above to prevent unauthorized use of your widget."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
