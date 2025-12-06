import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project, createDefaultProject, validateProject } from '@/lib/models/project';

/**
 * GET /api/projects - Get all projects
 */
export async function GET() {
    try {
        const db = await getDatabase();
        const projects = await db
            .collection<Project>('projects')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
    import { NextResponse } from 'next/server';
    import { getDatabase } from '@/lib/mongodb';
    import { Project, createDefaultProject, validateProject } from '@/lib/models/project';

    /**
     * GET /api/projects - Get all projects
     */
    export async function GET() {
        try {
            const db = await getDatabase();
            const projects = await db
                .collection<Project>('projects')
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            return NextResponse.json({ projects });
        } catch (error) {
            console.error('Error fetching projects:', error);
            return NextResponse.json(
                { error: 'Failed to fetch projects' },
                { status: 500 }
            );
        }
    }

    /**
     * POST /api/projects - Create a new project
     */
    export async function POST(request: Request) {
        try {
            const body = await request.json();
            const { name, id, config } = body;

            if (!name) {
                return NextResponse.json(
                    { error: 'Project name is required' },
                    { status: 400 }
                );
            }

            // Generate ID if not provided
            const projectId = id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create project with provided config or default config
            const project = config
                ? { ...createDefaultProject(name, projectId), config }
                : createDefaultProject(name, projectId);

            // Validate project
            const errors = validateProject(project);
            if (errors.length > 0) {
                return NextResponse.json(
                    { error: 'Validation failed', errors },
                    { status: 400 }
                );
            }

            // Insert into database
            const db = await getDatabase();
            const result = await db.collection<Project>('projects').insertOne(project);

            // Return created project
            const createdProject = await db
                .collection<Project>('projects')
                .findOne({ _id: result.insertedId });

            return NextResponse.json({ project: createdProject }, { status: 201 });
        } catch (error) {
            console.error('Error creating project:', error);
            return NextResponse.json(
                { error: 'Failed to create project' },
                { status: 500 }
            );
        }
    }
