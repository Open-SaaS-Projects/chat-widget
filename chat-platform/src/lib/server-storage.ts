import { WidgetConfig } from "@/context/WidgetContext";
import fs from "fs";
import path from "path";

export interface Project {
    id: string;
    userId: string;
    name: string;
    config: WidgetConfig;
    createdAt: string;
    updatedAt: string;
}

// Storage directory
const STORAGE_DIR = path.join(process.cwd(), '.storage');

// Ensure storage directory exists
try {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
} catch (error) {
    console.error('Failed to create storage directory:', error);
}

const PROJECT_FILE = (projectId: string) => path.join(STORAGE_DIR, `${projectId}.json`);

// Server-side: read from filesystem
export function getServerProject(projectId: string): Project | null {
    try {
        const filePath = PROJECT_FILE(projectId);
        if (!fs.existsSync(filePath)) return null;

        const projectData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(projectData);
    } catch (error) {
        console.error('Error reading project:', error);
        return null;
    }
}

// Server-side: save to filesystem
export function saveServerProject(project: Project): void {
    try {
        const filePath = PROJECT_FILE(project.id);
        fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
        console.log("✅ Project saved to filesystem:", filePath);
    } catch (error) {
        console.error('Error saving project to filesystem:', error);
    }
}

// Server-side: get all projects
export function getServerUserProjects(userId: string): Project[] {
    try {
        const files = fs.readdirSync(STORAGE_DIR);
        const projects: Project[] = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const projectData = fs.readFileSync(path.join(STORAGE_DIR, file), 'utf-8');
                const project: Project = JSON.parse(projectData);
                if (project.userId === userId) {
                    projects.push(project);
                }
            }
        }

        return projects;
    } catch (error) {
        console.error('Error reading projects:', error);
        return [];
    }
}
