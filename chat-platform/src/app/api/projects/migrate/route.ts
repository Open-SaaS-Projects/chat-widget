import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/project';

/**
 * POST /api/projects/migrate - Migrate localStorage data to MongoDB
 * This endpoint accepts an array of projects from localStorage and imports them to MongoDB
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projects } = body;

        if (!Array.isArray(projects)) {
            return NextResponse.json(
                { error: 'Projects must be an array' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const project of projects) {
            try {
                // Check if project already exists
                const existing = await db
                    .collection<Project>('projects')
                    .findOne({ id: project.id });

                if (existing) {
                    console.log(`Project ${project.id} already exists, skipping`);
                    results.failed++;
                    results.errors.push(`Project ${project.id} already exists`);
                    continue;
                }

                // Prepare project for insertion
                const projectToInsert: Project = {
                    id: project.id,
                    name: project.name || 'Untitled Project',
                    createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
                    updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
                    config: project.config,
                };

                // Insert project
                await db.collection<Project>('projects').insertOne(projectToInsert);
                results.success++;
                console.log(`✅ Migrated project: ${projectToInsert.name}`);
            } catch (error) {
                results.failed++;
                const errorMsg = `Failed to migrate project ${project.id}: ${error}`;
                results.errors.push(errorMsg);
                console.error(errorMsg);
            }
        }

        return NextResponse.json({
            message: 'Migration complete',
            results,
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: 'Migration failed', details: String(error) },
            { status: 500 }
        );
    }
}
