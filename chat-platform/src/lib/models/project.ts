import { ObjectId } from 'mongodb';

/**
 * Project interface matching MongoDB document structure
 */
export interface Project {
    _id?: ObjectId;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    config: WidgetConfig;
}

/**
 * Widget configuration interface
 */
export interface WidgetConfig {
    position: 'left' | 'right';
    websiteUrl: string;
    colors: {
        primary: string;
        header: string;
        background: string;
        foreground: string;
        input: string;
    };
    branding: {
        chatIcon: string | null;
        agentIcon: string | null;
        userIcon: string | null;
        showChatIcon: boolean;
        showAgentAvatar: boolean;
        showUserAvatar: boolean;
    };
    text: {
        headerTitle: string;
        welcomeMessage: string;
        placeholder: string;
    };
    persona: {
        tone: string;
        agentType: string;
        responseLength: string;
        customInstructions: string;
    };
    workflow?: any;
    apiWhitelist?: string[];
}

/**
 * Create a new project with default configuration
 */
export function createDefaultProject(name: string, id: string): Project {
    return {
        id,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        config: {
            position: 'right',
            websiteUrl: '',
            colors: {
                primary: '#6320CE',
                header: '#6320CE',
                background: '#FFFFFF',
                foreground: '#000000',
                input: '#F3F4F6',
            },
            branding: {
                chatIcon: null,
                agentIcon: null,
                userIcon: null,
                showChatIcon: true,
                showAgentAvatar: true,
                showUserAvatar: true,
            },
            text: {
                headerTitle: 'Chat with us',
                welcomeMessage: 'Hi! How can I help you today?',
                placeholder: 'Type your message...',
            },
            persona: {
                tone: 'friendly',
                agentType: 'general',
                responseLength: 'balanced',
                customInstructions: '',
            },
        },
    };
}

/**
 * Validate project data
 */
export function validateProject(project: Partial<Project>): string[] {
    const errors: string[] = [];

    if (!project.id) {
        errors.push('Project ID is required');
    }

    if (!project.name || project.name.trim().length === 0) {
        errors.push('Project name is required');
    }

    if (project.config) {
        if (!['left', 'right'].includes(project.config.position)) {
            errors.push('Position must be "left" or "right"');
        }

        if (project.config.websiteUrl && project.config.websiteUrl.length > 0) {
            try {
                new URL(project.config.websiteUrl);
            } catch {
                errors.push('Website URL must be a valid URL');
            }
        }
    }

    return errors;
}
