"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Trash2, Brain as BrainIcon, Loader2 } from "lucide-react";
import { useWidget } from "@/context/WidgetContext";
import Logo from "@/components/ui/Logo";

export default function BrainPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { projectName } = useWidget();
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<any[]>([]); // In real app, fetch from API

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", id);

        try {
            const response = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const result = await response.json();

            // Add to local list (in real app, re-fetch list)
            setFiles(prev => [...prev, {
                id: result.id,
                name: file.name,
                status: result.status,
                chunks: result.chunks,
                date: new Date().toLocaleDateString()
            }]);

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <Logo />
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <Link
                        href={`/project/${id}`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {projectName || "Project"} / Brain
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BrainIcon className="h-6 w-6 text-primary" />
                                Knowledge Base
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Upload documents to train your AI agent.
                            </p>
                        </div>

                        <label className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer
                            ${uploading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25"}
                        `}>
                            {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                            {uploading ? "Processing..." : "Upload File"}
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.txt,.md"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    {/* File List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {files.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No documents yet</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Upload PDF, DOCX, or Text files to get started.
                                </p>
                            </div>
                        ) : (
                            files.map((file, index) => (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {file.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {file.date}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    {file.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {file.chunks} chunks
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
