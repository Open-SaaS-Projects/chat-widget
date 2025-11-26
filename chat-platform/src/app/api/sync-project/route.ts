import { NextResponse } from "next/server";
import { saveServerProject } from "@/lib/server-storage";
import type { Project } from "@/lib/storage";

export async function POST(request: Request) {
    try {
        const project: Project = await request.json();
        saveServerProject(project);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error syncing project:', error);
        return NextResponse.json({ error: 'Failed to sync project' }, { status: 500 });
    }
}
