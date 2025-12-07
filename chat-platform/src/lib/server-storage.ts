
import { getDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/project";

/**
 * Get a single project from MongoDB (Server-Side)
 * This is used by API routes to fetch project data directly from the DB
 */
export async function getServerProject(projectId: string): Promise<Project | null> {
    try {
        const db = await getDatabase();
        // Match by 'id' field (the string ID), not '_id' (ObjectId)
        const project = await db.collection<Project>("projects").findOne({ id: projectId });
        return project;
    } catch (error) {
        console.error("Error fetching project from server storage:", error);
        return null;
    }
}
