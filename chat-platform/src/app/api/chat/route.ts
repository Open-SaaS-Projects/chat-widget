import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, project_id, history } = body;

        if (!query || !project_id) {
            return NextResponse.json(
                { error: 'Missing query or project_id' },
                { status: 400 }
            );
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
                history: history || []
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
