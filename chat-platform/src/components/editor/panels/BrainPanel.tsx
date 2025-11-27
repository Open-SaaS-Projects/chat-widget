"use client";

import { useState } from "react";
import { Upload, FileText, Trash2, Loader2, Brain } from "lucide-react";
import { useWidget } from "@/context/WidgetContext";

export default function BrainPanel() {
    const { projectId } = useWidget();
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<any[]>([]); // In real app, fetch from API

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", projectId || "");

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
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Knowledge Base
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Upload documents to train your AI agent.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Upload className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Upload Documents
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    PDF, DOCX, TXT, or MD
                </p>

                <label className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                    ${uploading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25"}
                `}>
                    {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Processing..." : "Select File"}
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
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Uploaded Files
                </h4>

                {files.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                        No documents yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {file.name}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                {file.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {file.chunks} chunks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
