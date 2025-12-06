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
    isLoading: boolean;
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
    const [isLoading, setIsLoading] = useState(false);

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

    const loadProject = useCallback(async (id: string) => {
        console.log("Loading project:", id);
        setIsLoading(true);
        try {
            const project = await getProject(id);
            console.log("Project loaded:", project);

            if (project) {
                setProjectId(project.id);
                setProjectName(project.name);
                setConfig(project.config);
                setInitialConfig(project.config);
                setHasUnsavedChanges(false);
            } else {
                console.error("Project not found:", id);
                // Optionally handle 404 state here or fetch error
            }
        } catch (error) {
            console.error("Error loading project:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveProject = useCallback(async () => {
        if (!projectId) {
            console.error("No project ID to save");
            return;
        }

        console.log("Saving project:", projectId);
        try {
            // Re-fetch to ensure we have the latest base data, or just use what we have
            const currentProject = await getProject(projectId);

            if (currentProject) {
                const updatedProject: Project = {
                    ...currentProject,
                    config,
                    name: projectName // Ensure name is preserved
                };

                const saved = await saveProjectStorage(updatedProject);
                if (saved) {
                    setInitialConfig(config);
                    setHasUnsavedChanges(false);
                    console.log("Project saved successfully");
                } else {
                    console.error("Failed to save project");
                }
            } else {
                console.error("Project not found for saving:", projectId);
            }
        } catch (error) {
            console.error("Error saving project:", error);
        }
    }, [projectId, config, projectName]);

    const renameProject = useCallback(async (newName: string) => {
        if (!projectId) return;

        try {
            const updatedProject = await renameProjectStorage(projectId, newName);
            if (updatedProject) {
                setProjectName(updatedProject.name);
                console.log("Project renamed successfully");
            }
        } catch (error) {
            console.error("Error renaming project:", error);
        }
    }, [projectId]);

    return (
        <WidgetContext.Provider
            value={{
                projectId,
                projectName,
                config,
                hasUnsavedChanges,
                isLoading,
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
