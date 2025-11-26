"use client";

import React, { createContext, useContext, useState } from "react";

export interface WidgetConfig {
    position: "left" | "right";
    websiteUrl: string;
    colors: {
        primary: string;
        header: string;
        background: string;
        foreground: string;
        input: string;
    };
    branding: {
        chatIcon: string | null;
        agentIcon: string | null;
        userIcon: string | null;
        showChatIcon: boolean;
        showAgentAvatar: boolean;
        showUserAvatar: boolean;
    };
    text: {
        headerTitle: string;
        welcomeMessage: string;
        placeholder: string;
    };
}

interface WidgetContextType {
    config: WidgetConfig;
    updateConfig: (updates: Partial<WidgetConfig>) => void;
    updateColors: (updates: Partial<WidgetConfig["colors"]>) => void;
    updateBranding: (updates: Partial<WidgetConfig["branding"]>) => void;
    updateText: (updates: Partial<WidgetConfig["text"]>) => void;
}

const defaultConfig: WidgetConfig = {
    position: "right",
    websiteUrl: "",
    colors: {
        primary: "#6320CE",
        header: "#ffffff",
        background: "#ffffff",
        foreground: "#000000",
        input: "#e5e7eb",
    },
    branding: {
        chatIcon: null,
        agentIcon: null,
        userIcon: null,
        showChatIcon: true,
        showAgentAvatar: true,
        showUserAvatar: true,
    },
    text: {
        headerTitle: "Chat Widget",
        welcomeMessage: "Hi! What can I help you with?",
        placeholder: "Message...",
    },
};

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<WidgetConfig>(defaultConfig);

    const updateConfig = (updates: Partial<WidgetConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    const updateColors = (updates: Partial<WidgetConfig["colors"]>) => {
        setConfig((prev) => ({ ...prev, colors: { ...prev.colors, ...updates } }));
    };

    const updateBranding = (updates: Partial<WidgetConfig["branding"]>) => {
        setConfig((prev) => ({ ...prev, branding: { ...prev.branding, ...updates } }));
    };

    const updateText = (updates: Partial<WidgetConfig["text"]>) => {
        setConfig((prev) => ({ ...prev, text: { ...prev.text, ...updates } }));
    };

    return (
        <WidgetContext.Provider
            value={{ config, updateConfig, updateColors, updateBranding, updateText }}
        >
            {children}
        </WidgetContext.Provider>
    );
}

export function useWidget() {
    const context = useContext(WidgetContext);
    if (context === undefined) {
        throw new Error("useWidget must be used within a WidgetProvider");
    }
    return context;
}
