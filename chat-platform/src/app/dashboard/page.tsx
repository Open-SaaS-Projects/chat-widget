"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import { getUserProjects, createProject as createProjectStorage, deleteProject, renameProject, Project } from "@/lib/storage";
import Logo from "@/components/ui/Logo";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            // Load projects from storage
            const userProjects = getUserProjects(user.email);
            setProjects(userProjects);
        }
    }, [user]);

    const createProject = () => {
        if (!user) return;

        // Create project with default configuration
        const newProject = createProjectStorage(
            user.email,
            `My Project ${projects.length + 1}`,
            {
                position: "right",
                websiteUrl: "",
                colors: {
                    primary: "#6320CE",
                    header: "#6320CE",
                    background: "#ffffff",
                    foreground: "#000000",
                    input: "#e5e7eb",
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
                    headerTitle: "Chat Widget",
                    welcomeMessage: "Hi! How can I help you?",
                    placeholder: "Message...",
                },
            }
        );

        setProjects([...projects, newProject]);
        router.push(`/project/${newProject.id}`);
    };

    const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            deleteProject(user.email, projectId);
            setProjects(projects.filter(p => p.id !== projectId));
        }
    };

    const startRename = (e: React.MouseEvent, project: Project) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(project.id);
        setEditingName(project.name);
    };

    const cancelRename = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(null);
        setEditingName("");
    };

    const saveRename = (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !editingName.trim()) return;

        const updatedProject = renameProject(projectId, editingName.trim());
        if (updatedProject) {
            setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
        }
        setEditingId(null);
        setEditingName("");
    };

    if (loading || !user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Welcome, {user.name}
                        </span>
                        {/* Logout button could go here */}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h2>
                    <button
                        onClick={createProject}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating a new chat widget project.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={createProject}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                New Project
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/project/${project.id}`}
                                className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group relative"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => startRename(e, project)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Rename Project"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteProject(e, project.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                {editingId === project.id ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveRename(e as any, project.id);
                                                if (e.key === 'Escape') cancelRename(e as any);
                                            }}
                                            className="flex-1 px-3 py-2 text-sm border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                            autoFocus
                                        />
                                        <button
                                            onClick={(e) => saveRename(e, project.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                            title="Save"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={cancelRename}
                                            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                            title="Cancel"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {project.name}
                                    </h3>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {project.id}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
