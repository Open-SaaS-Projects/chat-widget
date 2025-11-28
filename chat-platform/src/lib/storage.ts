import { WidgetConfig } from "@/context/WidgetContext";

export interface Project {
    id: string;
    userId: string;
    name: string;
    config: WidgetConfig;
    createdAt: string;
    updatedAt: string;
}

// Generate unique project ID
export function generateProjectId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return `proj_${timestamp}${randomStr}`;
}

// Storage keys
const PROJECTS_KEY = (userId: string) => `projects:${userId}`;
const PROJECT_KEY = (projectId: string) => `project:${projectId}`;

// Get all projects for a user
export function getUserProjects(userId: string): Project[] {
    if (typeof window === 'undefined') return [];

    const projectsJson = localStorage.getItem(PROJECTS_KEY(userId));
    if (!projectsJson) return [];

    const projectIds: string[] = JSON.parse(projectsJson);
    return projectIds
        .map(id => getProject(id))
        .filter((p): p is Project => p !== null);
}

// Get a single project
export function getProject(projectId: string): Project | null {
    if (typeof window === 'undefined') return null;

    const projectJson = localStorage.getItem(PROJECT_KEY(projectId));
    if (!projectJson) return null;
    return JSON.parse(projectJson);
}

// Create a new project
export function createProject(userId: string, name: string, config: WidgetConfig): Project {
    const project: Project = {
        id: generateProjectId(),
        userId,
        name,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // Save to appropriate storage
    saveProject(project);

    // Update user's project list (client-side only)
    if (typeof window !== 'undefined') {
        const projectsJson = localStorage.getItem(PROJECTS_KEY(userId));
        const projectIds: string[] = projectsJson ? JSON.parse(projectsJson) : [];
        projectIds.push(project.id);
        localStorage.setItem(PROJECTS_KEY(userId), JSON.stringify(projectIds));
    }

    return project;
}

// Update a project's configuration
export function updateProject(projectId: string, config: Partial<WidgetConfig>): Project | null {
    const project = getProject(projectId);
    if (!project) return null;

    const updatedProject: Project = {
        ...project,
        config: { ...project.config, ...config },
        updatedAt: new Date().toISOString(),
    };

    saveProject(updatedProject);
    return updatedProject;
}

// Save/update entire project
export function saveProject(project: Project): void {
    const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString(),
    };

    console.log("💾 Saving project:", updatedProject.id);
    console.log("📦 Config:", JSON.stringify(updatedProject.config, null, 2));

    if (typeof window !== 'undefined') {
        // Client-side: save to localStorage
        localStorage.setItem(PROJECT_KEY(project.id), JSON.stringify(updatedProject));

        // Client-side: also sync to server via API
        fetch('/api/sync-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProject),
        }).catch(err => console.error('Failed to sync to server:', err));
    }

    console.log("✅ Project saved successfully");
}

// Rename a project
export function renameProject(projectId: string, newName: string): Project | null {
    const project = getProject(projectId);
    if (!project) return null;

    const updatedProject: Project = {
        ...project,
        name: newName,
        updatedAt: new Date().toISOString(),
    };

    saveProject(updatedProject);
    return updatedProject;
}

// Delete a project
export function deleteProject(userId: string, projectId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(PROJECT_KEY(projectId));

        const projectsJson = localStorage.getItem(PROJECTS_KEY(userId));
        if (projectsJson) {
            const projectIds: string[] = JSON.parse(projectsJson);
            const filtered = projectIds.filter(id => id !== projectId);
            localStorage.setItem(PROJECTS_KEY(userId), JSON.stringify(filtered));
        }
    }
}

// Check if project exists
export function projectExists(projectId: string): boolean {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(PROJECT_KEY(projectId)) !== null;
    }
    return false;
}
