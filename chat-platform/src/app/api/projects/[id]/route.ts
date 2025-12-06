import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project, validateProject } from '@/lib/models/project';

/**
 * GET /api/projects/[id] - Get a specific project
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const db = await getDatabase();
        const project = await db
            .collection<Project>('projects')
            .findOne({ id });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/projects/[id] - Update a project
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        const db = await getDatabase();

        // Check if project exists
        const existingProject = await db
            .collection<Project>('projects')
            .findOne({ id });

        if (!existingProject) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Prepare update
        const update: Partial<Project> = {
            updatedAt: new Date(),
        };

        if (body.name) {
            update.name = body.name;
        }

        if (body.config) {
            update.config = body.config;
        }

        // Validate if config is being updated
        if (update.config) {
            const errors = validateProject({ ...existingProject, ...update });
            if (errors.length > 0) {
                return NextResponse.json(
                    { error: 'Validation failed', errors },
                    { status: 400 }
                );
            }
        }

        // Update project
        await db
            .collection<Project>('projects')
            .updateOne({ id }, { $set: update });

        // Get updated project
        const updatedProject = await db
            .collection<Project>('projects')
            .findOne({ id });

        return NextResponse.json({ project: updatedProject });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/projects/[id] - Delete a project
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const db = await getDatabase();
        const result = await db
            .collection<Project>('projects')
            .deleteOne({ id });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
