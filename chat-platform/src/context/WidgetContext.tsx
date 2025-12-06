"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getProject, saveProject as saveProjectStorage, renameProject as renameProjectStorage, Project } from "@/lib/storage";
import { WorkflowDefinition } from "@/lib/workflow-types";

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
    persona: {
        tone: string;
        agentType: string;
        responseLength: string;
        customInstructions: string;
    };
    workflow?: WorkflowDefinition; // Optional - for custom workflows
    apiWhitelist?: string[]; // Optional - allowed domains for API calls
}

interface WidgetContextType {
    projectId: string | null;
    projectName: string;
    config: WidgetConfig;
    hasUnsavedChanges: boolean;
    updateConfig: (updates: Partial<WidgetConfig>) => void;
    updateColors: (updates: Partial<WidgetConfig["colors"]>) => void;
    updateBranding: (updates: Partial<WidgetConfig["branding"]>) => void;
    updateText: (updates: Partial<WidgetConfig["text"]>) => void;
    updatePersona: (updates: Partial<WidgetConfig["persona"]>) => void;
    updateWorkflow: (workflow: WorkflowDefinition | undefined) => void;
    updateApiWhitelist: (whitelist: string[]) => void;
    loadProject: (projectId: string) => void;
    saveProject: () => void;
    renameProject: (name: string) => void;
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
    persona: {
        tone: "friendly",
        agentType: "general",
        responseLength: "medium",
        customInstructions: "",
    },
};

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
    const [projectId, setProjectId] = useState<string | null>(null);
    const [projectName, setProjectName] = useState<string>("Untitled Project");
    const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [initialConfig, setInitialConfig] = useState<WidgetConfig>(defaultConfig);

    const updateConfig = useCallback((updates: Partial<WidgetConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
    }, []);

    const updateColors = useCallback((updates: Partial<WidgetConfig["colors"]>) => {
        setConfig((prev) => ({ ...prev, colors: { ...prev.colors, ...updates } }));
        setHasUnsavedChanges(true);
    }, []);

    const updateBranding = useCallback((updates: Partial<WidgetConfig["branding"]>) => {
        setConfig((prev) => ({ ...prev, branding: { ...prev.branding, ...updates } }));
        setHasUnsavedChanges(true);
    }, []);

    const updateText = useCallback((updates: Partial<WidgetConfig["text"]>) => {
        setConfig((prev) => ({ ...prev, text: { ...prev.text, ...updates } }));
        setHasUnsavedChanges(true);
    }, []);

    const updatePersona = useCallback((updates: Partial<WidgetConfig["persona"]>) => {
        setConfig((prev) => ({ ...prev, persona: { ...prev.persona, ...updates } }));
        setHasUnsavedChanges(true);
    }, []);

    const updateWorkflow = useCallback((workflow: WorkflowDefinition | undefined) => {
        setConfig((prev) => ({ ...prev, workflow }));
        setHasUnsavedChanges(true);
    }, []);

    const updateApiWhitelist = useCallback((whitelist: string[]) => {
        setConfig((prev) => ({ ...prev, apiWhitelist: whitelist }));
        setHasUnsavedChanges(true);
    }, []);

    const loadProject = useCallback((id: string) => {
        console.log("Loading project:", id);
        const project = getProject(id);
        console.log("Project loaded:", project);
        if (project) {
            setProjectId(project.id);
            setProjectName(project.name);
            setConfig(project.config);
            setInitialConfig(project.config);
            setHasUnsavedChanges(false);

            // Immediately save to server storage to make it available for API
            console.log("🔄 Syncing project to server storage for API access");
            saveProjectStorage(project);
        } else {
            console.error("Project not found:", id);
        }
    }, []);

    const saveProject = useCallback(() => {
        if (!projectId) {
            console.error("No project ID to save");
            return;
        }

        console.log("Saving project:", projectId);
        const project = getProject(projectId);
        if (project) {
            const updatedProject: Project = {
                ...project,
                config,
            };
            saveProjectStorage(updatedProject);
            setInitialConfig(config);
            setHasUnsavedChanges(false);
            console.log("Project saved successfully");
        } else {
            console.error("Project not found for saving:", projectId);
        }
    }, [projectId, config]);

    const renameProject = useCallback((newName: string) => {
        if (!projectId) return;

        const updatedProject = renameProjectStorage(projectId, newName);
        if (updatedProject) {
            setProjectName(updatedProject.name);
            console.log("Project renamed successfully");
        }
    }, [projectId]);

    return (
        <WidgetContext.Provider
            value={{
                projectId,
                projectName,
                config,
                hasUnsavedChanges,
                updateConfig,
                updateColors,
                updateBranding,
                updateText,
                updatePersona,
                updateWorkflow,
                updateApiWhitelist,
                loadProject,
                saveProject,
                renameProject,
            }}
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
