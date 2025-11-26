"use client";

import { useWidget } from "@/context/WidgetContext";
import { MessageCircle, X, Send, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PreviewAreaProps {
    device: "desktop" | "mobile";
}

export default function PreviewArea({ device }: PreviewAreaProps) {
    const { config } = useWidget();
    const [isOpen, setIsOpen] = useState(true);

    // iPhone 17 Pro Max dimensions: 430x932 (scaled down to fit)
    const containerStyle = device === "mobile"
        ? "w-[393px] h-[852px] rounded-[3.5rem] border-[12px] border-gray-900 shadow-2xl bg-gray-900"
        : "w-full h-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-700";

    return (
        <div className={`relative overflow-hidden transition-all duration-300 ${containerStyle}`}>
            {/* iPhone Dynamic Island */}
            {device === "mobile" && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-[28px] z-50 shadow-lg" />
            )}

            {/* Website Preview or Mock Content */}
            <div className="absolute inset-0 bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
                {config.websiteUrl ? (
                    <iframe
                        src={config.websiteUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        title="Website Preview"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                ) : (
                    <div className="absolute inset-0 p-8 space-y-4 opacity-10 pointer-events-none">
                        <div className="h-8 w-32 bg-gray-900 dark:bg-white rounded" />
                        <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    </div>
                )}

                {/* Chat Widget Container */}
                <div className={`absolute ${device === "mobile" ? "bottom-4" : "bottom-6"} ${config.position === "left" ? (device === "mobile" ? "left-4" : "left-6") : (device === "mobile" ? "right-4" : "right-6")} flex flex-col ${config.position === "left" ? "items-start" : "items-end"} gap-3 z-10`}>

                    {/* Chat Window */}
                    {isOpen && (
                        <div
                            className={`${device === "mobile" ? "w-[340px] h-[480px]" : "w-[350px] h-[500px]"} bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${config.position === "left" ? "origin-bottom-left" : "origin-bottom-right"}`}
                            style={{
                                backgroundColor: config.colors.background,
                                color: config.colors.foreground
                            }}
                        >
                            {/* Header */}
                            <div
                                className="p-4 flex items-center justify-between"
                                style={{ backgroundColor: config.colors.header }}
                            >
                                <div className="flex items-center gap-3">
                                    {config.branding.showAgentAvatar && (
                                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                                            {config.branding.agentIcon ? (
                                                <Image src={config.branding.agentIcon} alt="Agent" fill className="object-cover" />
                                            ) : (
                                                <User className="h-6 w-6 text-white" />
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-white">{config.text.headerTitle}</h3>
                                        <p className="text-xs text-white/80">Online</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {/* Welcome Message */}
                                <div className="flex gap-3 items-start">
                                    {config.branding.showAgentAvatar && (
                                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {config.branding.agentIcon ? (
                                                <Image src={config.branding.agentIcon} alt="Agent" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-sm">{config.text.welcomeMessage}</p>
                                    </div>
                                </div>

                                {/* User Message Example */}
                                <div className="flex gap-3 flex-row-reverse items-start">
                                    {config.branding.showUserAvatar && (
                                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {config.branding.userIcon ? (
                                                <Image src={config.branding.userIcon} alt="User" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div
                                        className="p-3 rounded-2xl rounded-tr-none max-w-[80%]"
                                        style={{ backgroundColor: config.colors.primary, color: '#fff' }}
                                    >
                                        <p className="text-sm">Hi! I have a question about pricing.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={config.text.placeholder}
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        style={{ borderColor: config.colors.input }}
                                    />
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        style={{ color: config.colors.primary }}
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-[10px] text-gray-400">Powered by MAKKN</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`${device === "mobile" ? "h-12 w-12" : "h-14 w-14"} rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95`}
                        style={{ backgroundColor: config.colors.primary }}
                    >
                        {config.branding.showChatIcon && config.branding.chatIcon ? (
                            <div className={`relative ${device === "mobile" ? "h-6 w-6" : "h-8 w-8"}`}>
                                <Image src={config.branding.chatIcon} alt="Chat" fill className="object-contain" />
                            </div>
                        ) : config.branding.showChatIcon ? (
                            <MessageCircle className={`${device === "mobile" ? "h-6 w-6" : "h-8 w-8"} text-white`} />
                        ) : (
                            <MessageCircle className={`${device === "mobile" ? "h-6 w-6" : "h-8 w-8"} text-white`} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
