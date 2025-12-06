import { NextResponse } from 'next/server';

/**
 * Validate that the request origin matches the project's configured website URL
 */
function validateOrigin(origin: string | null, configuredUrl: string): boolean {
    if (!origin || !configuredUrl) {
        return false;
    }

    try {
        const originUrl = new URL(origin);
        const configUrl = new URL(configuredUrl);

        // Compare hostname (domain)
        // Support wildcards for subdomains (e.g., *.example.com)
        if (configUrl.hostname.startsWith('*.')) {
            const baseDomain = configUrl.hostname.substring(2);
            return originUrl.hostname.endsWith(baseDomain);
        }

        // Exact domain match
        return originUrl.hostname === configUrl.hostname;
    } catch (error) {
        console.error('Error validating origin:', error);
        return false;
    }
}

/**
 * Get project configuration from storage
 */
async function getProjectConfig(projectId: string): Promise<any> {
    try {
        // In production, this would fetch from a database
        // For now, we'll return null and let the validation happen on widget load
        // The widget already loads config from /api/config/[id]
        return null;
    } catch (error) {
        console.error('Error fetching project config:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, project_id, session_id, history, persona } = body;

        if (!query || !project_id) {
            return NextResponse.json(
                { error: 'Missing query or project_id' },
                { status: 400 }
            );
        }

        // Get the origin header
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');

        // For development/testing, allow localhost
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isLocalhost = origin?.includes('localhost') || referer?.includes('localhost');

        if (!isDevelopment && !isLocalhost) {
            // Get project configuration
            const projectConfig = await getProjectConfig(project_id);

            // If we have a configured website URL, validate the origin
            if (projectConfig?.websiteUrl) {
                const isValidOrigin = validateOrigin(origin, projectConfig.websiteUrl);

                if (!isValidOrigin) {
                    console.warn(`🚫 Unauthorized origin for project ${project_id}: ${origin}`);
                    console.warn(`   Expected: ${projectConfig.websiteUrl}`);

                    return NextResponse.json(
                        {
                            error: 'Unauthorized: This chat widget is not authorized for this domain',
                            message: 'Please contact the website administrator.'
                        },
                        { status: 403 }
                    );
                }

                console.log(`✅ Origin validated for project ${project_id}: ${origin}`);
            }
        }

        const aiAgentUrl = process.env.AI_AGENT_API_URL || 'http://localhost:8001';

        console.log(`🚀 Proxying chat request to: ${aiAgentUrl}/chat`);

        const response = await fetch(`${aiAgentUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                project_id,
                session_id,
                history: history || [],
                persona: persona || {}
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ AI Agent Service error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get response from AI Agent' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('❌ Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
