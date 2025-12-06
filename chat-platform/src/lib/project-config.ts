/**
 * Shared utility for loading project configuration
 * This would be replaced with database calls in production
 */

export interface ProjectConfig {
    id: string;
    name: string;
    websiteUrl: string;
    config: any;
}

/**
 * Get project configuration from localStorage (client-side) or storage (server-side)
 * In production, this should fetch from a database
 */
export async function getProjectConfig(projectId: string): Promise<ProjectConfig | null> {
    try {
        // Server-side: In production, fetch from database
        // For now, we return null and rely on client-side validation

        // This is a placeholder for production database integration
        // Example:
        // const project = await db.projects.findOne({ id: projectId });
        // return project;

        return null;
    } catch (error) {
        console.error('Error fetching project config:', error);
        return null;
    }
}

/**
 * Validate that the request origin matches the project's configured website URL
 */
export function validateOrigin(origin: string | null, configuredUrl: string): boolean {
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
 * Check if request is from localhost (development)
 */
export function isLocalhost(origin: string | null, referer: string | null): boolean {
    return origin?.includes('localhost') ||
        origin?.includes('127.0.0.1') ||
        referer?.includes('localhost') ||
        referer?.includes('127.0.0.1') ||
        false;
}
