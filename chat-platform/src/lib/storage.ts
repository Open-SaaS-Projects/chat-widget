import { WidgetConfig } from "@/context/WidgetContext";

export interface Project {
    id: string;
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

/**
 * Get all projects from MongoDB via API
 */
export async function getUserProjects(): Promise<Project[]> {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        return data.projects || [];
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

/**
 * Get a single project from MongoDB via API
 */
export async function getProject(projectId: string): Promise<Project | null> {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        return data.project;
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
}

/**
 * Create a new project in MongoDB via API
 */
export async function createProject(name: string, config: WidgetConfig): Promise<Project | null> {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, config }),
        });

        if (!response.ok) {
            throw new Error('Failed to create project');
        }

        const data = await response.json();
        return data.project;
    } catch (error) {
        console.error('Error creating project:', error);
        return null;
    }
}

/**
 * Update a project's configuration in MongoDB via API
 */
export async function updateProject(projectId: string, updates: Partial<{ name: string; config: WidgetConfig }>): Promise<Project | null> {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update project');
        }

        const data = await response.json();
        return data.project;
    } catch (error) {
        console.error('Error updating project:', error);
        return null;
    }
}

/**
 * Save/update entire project in MongoDB via API
 */
export async function saveProject(project: Partial<Project>): Promise<void> {
    if (!project.id) {
        console.error('Cannot save project without ID');
        return;
    }

    console.log("💾 Saving project:", project.id);
    console.log("📦 Config:", JSON.stringify(project.config, null, 2));

    try {
        await updateProject(project.id, {
            name: project.name,
            config: project.config,
        });
        console.log("✅ Project saved successfully");
    } catch (error) {
        console.error("❌ Failed to save project:", error);
    }
}

/**
 * Rename a project in MongoDB via API
 */
export async function renameProject(projectId: string, newName: string): Promise<Project | null> {
    return updateProject(projectId, { name: newName });
}

/**
 * Delete a project from MongoDB via API
 */
export async function deleteProject(projectId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete project');
        }

        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        return false;
    }
}

/**
 * Check if project exists in MongoDB via API
 */
export async function projectExists(projectId: string): Promise<boolean> {
    const project = await getProject(projectId);
    return project !== null;
}

/**
 * MIGRATION UTILITY: Export localStorage data
 * Call this before migrating to MongoDB
 */
export function exportLocalStorageProjects(): any[] {
    if (typeof window === 'undefined') return [];

    const projects: any[] = [];

    // Scan localStorage for project keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('project:')) {
            const projectJson = localStorage.getItem(key);
            if (projectJson) {
                try {
                    const project = JSON.parse(projectJson);
                    projects.push(project);
                } catch (error) {
                    console.error(`Failed to parse project ${key}:`, error);
                }
            }
        }
    }

    console.log(`📤 Exported ${projects.length} projects from localStorage`);
    return projects;
}

/**
 * MIGRATION UTILITY: Import projects to MongoDB
 * Call this to migrate localStorage data to MongoDB
 */
export async function migrateLocalStorageToMongoDB(): Promise<{ success: number; failed: number }> {
    const localProjects = exportLocalStorageProjects();

    if (localProjects.length === 0) {
        console.log('No projects to migrate');
        return { success: 0, failed: 0 };
    }

    console.log(`🔄 Migrating ${localProjects.length} projects to MongoDB...`);

    let success = 0;
    let failed = 0;

    for (const project of localProjects) {
        try {
            // Create project in MongoDB
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: project.id,
                    name: project.name,
                    config: project.config,
                }),
            });

            if (response.ok) {
                success++;
                console.log(`✅ Migrated project: ${project.name}`);
            } else {
                failed++;
                console.error(`❌ Failed to migrate project: ${project.name}`);
            }
        } catch (error) {
            failed++;
            console.error(`❌ Error migrating project ${project.name}:`, error);
        }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);

    return { success, failed };
}

/**
 * MIGRATION UTILITY: Clear localStorage after successful migration
 * CAUTION: This will delete all localStorage data!
 */
export function clearLocalStorageProjects(): void {
    if (typeof window === 'undefined') return;

    const keysToDelete: string[] = [];

    // Find all project-related keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('project:') || key.startsWith('projects:'))) {
            keysToDelete.push(key);
        }
    }

    // Delete them
    keysToDelete.forEach(key => localStorage.removeItem(key));

    console.log(`🗑️ Cleared ${keysToDelete.length} items from localStorage`);
}
