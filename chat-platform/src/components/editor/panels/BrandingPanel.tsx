"use client";

import { useWidget } from "@/context/WidgetContext";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
}

function ImageUpload({ label, value, onChange }: ImageUploadProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange(url);
        }
    };

    return (
        <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden group hover:border-primary transition-colors">
                    {value ? (
                        <>
                            <Image src={value} alt={label} fill className="object-cover" />
                            <button
                                onClick={() => onChange(null)}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </>
                    ) : (
                        <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Supported formats: JPG, PNG, SVG</p>
                    <p>Max size: 2MB</p>
                </div>
            </div>
        </div>
    );
}

export default function BrandingPanel() {
    const { config, updateBranding } = useWidget();

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Icons & Avatars
                </h3>
                <div className="space-y-6">
                    {/* Chat Icon */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Icon</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.branding.showChatIcon}
                                    onChange={(e) => updateBranding({ showChatIcon: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {config.branding.showChatIcon && (
                            <ImageUpload
                                label=""
                                value={config.branding.chatIcon}
                                onChange={(val) => updateBranding({ chatIcon: val })}
                            />
                        )}
                    </div>

                    {/* Agent Avatar */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Avatar</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.branding.showAgentAvatar}
                                    onChange={(e) => updateBranding({ showAgentAvatar: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {config.branding.showAgentAvatar && (
                            <ImageUpload
                                label=""
                                value={config.branding.agentIcon}
                                onChange={(val) => updateBranding({ agentIcon: val })}
                            />
                        )}
                    </div>

                    {/* User Avatar */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Avatar</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.branding.showUserAvatar}
                                    onChange={(e) => updateBranding({ showUserAvatar: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {config.branding.showUserAvatar && (
                            <ImageUpload
                                label=""
                                value={config.branding.userIcon}
                                onChange={(val) => updateBranding({ userIcon: val })}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
