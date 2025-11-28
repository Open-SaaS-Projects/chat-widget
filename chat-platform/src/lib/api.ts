const KB_API_URL = process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL || 'http://localhost:8000';

export interface Document {
    id: string;
    project_id: string;
    filename: string;
    file_type: string;
    file_path: string;
    upload_date: string;
    status: "processing" | "completed" | "failed";
    chunks_count?: number;
    error?: string;
    source_type?: "file" | "website";
    url?: string;
}

export async function uploadFile(file: File, projectId: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);

    const response = await fetch(`${KB_API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }

    return response.json();
}

export async function crawlWebsite(url: string, projectId: string): Promise<Document> {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('project_id', projectId);

    const response = await fetch(`${KB_API_URL}/crawl`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to crawl website');
    }

    return response.json();
}

export async function getDocuments(projectId: string): Promise<Document[]> {
    const response = await fetch(`${KB_API_URL}/documents?project_id=${projectId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch documents');
    }

    return response.json();
}

export async function deleteDocument(docId: string): Promise<void> {
    const response = await fetch(`${KB_API_URL}/documents/${docId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete document');
    }
}
