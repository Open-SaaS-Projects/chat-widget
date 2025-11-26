import { NextResponse } from "next/server";
import { getServerProject } from "@/lib/server-storage";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    // Await params for Next.js 15
    const { projectId } = await params;

    console.log("🔍 API: Fetching project:", projectId);

    // Fetch project from storage
    const project = getServerProject(projectId);

    if (!project) {
        console.error("❌ API: Project not found:", projectId);
        return NextResponse.json(
            { error: "Project not found" },
            {
                status: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            }
        );
    }

    console.log("✅ API: Project found:", project.id);
    console.log("📤 API: Returning config:", JSON.stringify(project.config, null, 2));

    // Return project configuration with CORS headers
    return NextResponse.json(project.config, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
