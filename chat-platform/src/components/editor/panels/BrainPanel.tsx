"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Loader2, Brain, Globe, Link as LinkIcon, User, Database, MessageSquare, Sparkles, Save } from "lucide-react";
import { useWidget } from "@/context/WidgetContext";
import { uploadFile, crawlWebsite, getDocuments, deleteDocument, Document } from "@/lib/api";
import DatabasePanel from "./DatabasePanel";

type Tab = "feeding" | "persona" | "database";

export default function BrainPanel() {
    const { projectId, config, updatePersona, saveProject } = useWidget();
    const [activeTab, setActiveTab] = useState<Tab>("feeding");
    const [uploading, setUploading] = useState(false);
    const [crawling, setCrawling] = useState(false);
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [savingPersona, setSavingPersona] = useState(false);

    useEffect(() => {
        if (projectId && activeTab === "feeding") {
            loadDocuments();
        }
    }, [projectId, activeTab]);

    const loadDocuments = async () => {
        if (!projectId) return;
        setLoadingDocs(true);
        try {
            const docs = await getDocuments(projectId);
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents:", error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !projectId) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const newDoc = await uploadFile(file, projectId);
            setDocuments(prev => [newDoc, ...prev]);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleCrawl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!websiteUrl || !projectId) return;

        setCrawling(true);
        try {
            const newDoc = await crawlWebsite(websiteUrl, projectId);
            setDocuments(prev => [newDoc, ...prev]);
            setWebsiteUrl("");
        } catch (error) {
            console.error("Crawl error:", error);
            alert("Failed to crawl website: " + (error as Error).message);
        } finally {
            setCrawling(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this source?")) return;

        try {
            await deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete document");
        }
    };

    const handleSavePersona = () => {
        setSavingPersona(true);
        saveProject();
        setTimeout(() => setSavingPersona(false), 1000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-6">
                <button
                    onClick={() => setActiveTab("feeding")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "feeding"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                >
                    <Brain className="h-4 w-4" />
                    Brain Feeding
                </button>
                <button
                    onClick={() => setActiveTab("persona")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "persona"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                >
                    <User className="h-4 w-4" />
                    Persona Building
                </button>
                <button
                    onClick={() => setActiveTab("database")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "database"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                >
                    <Database className="h-4 w-4" />
                    Database Accessing
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "feeding" && (
                    <div className="space-y-8">
                        {/* Website Crawling Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" />
                                Website Crawling
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <form onSubmit={handleCrawl} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={crawling}
                                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {crawling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crawl"}
                                    </button>
                                </form>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Enter a URL to scrape its content and add it to the knowledge base.
                                </p>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="h-4 w-4 text-primary" />
                                Upload Documents
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
                                <label className={`
                                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                    ${uploading
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-gray-700 dark:text-gray-200"}
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Supported formats: PDF, DOCX, TXT, MD
                                </p>
                            </div>
                        </div>

                        {/* Data Sources List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Data Sources
                            </h3>

                            {loadingDocs ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                    No documents or websites added yet
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${doc.source_type === 'website'
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                    {doc.source_type === 'website' ? (
                                                        <Globe className="h-4 w-4" />
                                                    ) : (
                                                        <FileText className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={doc.filename}>
                                                        {doc.filename}
                                                    </h5>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${doc.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            doc.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            {doc.status}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {doc.chunks_count || 0} chunks • {new Date(doc.upload_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "persona" && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Build Your Agent Persona</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Customize how your AI agent communicates and behaves.
                            </p>
                        </div>

                        {/* Agent Type */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Agent Type
                            </label>
                            <select
                                value={config.persona?.agentType || "general"}
                                onChange={(e) => updatePersona({ agentType: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="general">General AI Agent</option>
                                <option value="support">Customer Support Agent</option>
                                <option value="sales">Sales Representative</option>
                                <option value="technical">Technical Support Specialist</option>
                                <option value="tutor">Educational Tutor</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Defines the base role and expertise of your agent.
                            </p>
                        </div>

                        {/* Tone & Voice */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Tone & Voice
                            </label>
                            <select
                                value={config.persona?.tone || "friendly"}
                                onChange={(e) => updatePersona({ tone: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="friendly">Friendly & Approachable</option>
                                <option value="professional">Professional & Formal</option>
                                <option value="casual">Casual & Relaxed</option>
                                <option value="empathetic">Empathetic & Supportive</option>
                                <option value="enthusiastic">Enthusiastic & Energetic</option>
                                <option value="concise">Concise & Direct</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Sets the personality and communication style.
                            </p>
                        </div>

                        {/* Response Length */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Response Length
                            </label>
                            <select
                                value={config.persona?.responseLength || "medium"}
                                onChange={(e) => updatePersona({ responseLength: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="short">Short & Concise</option>
                                <option value="medium">Balanced (Recommended)</option>
                                <option value="detailed">Detailed & Comprehensive</option>
                            </select>
                        </div>

                        {/* Custom Instructions */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Custom Instructions
                            </label>
                            <textarea
                                value={config.persona?.customInstructions || ""}
                                onChange={(e) => updatePersona({ customInstructions: e.target.value })}
                                placeholder="e.g., Always mention our 24/7 support, never discuss pricing, use emojis..."
                                className="w-full h-32 px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Specific rules or knowledge the agent should follow.
                            </p>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSavePersona}
                            disabled={savingPersona}
                            className="w-full py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {savingPersona ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Persona Settings
                                </>
                            )}
                        </button>
                    </div>
                )}

                {activeTab === "database" && (
                    <DatabasePanel />
                )}
            </div>
        </div>
    );
}
