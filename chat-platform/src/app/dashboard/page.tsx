"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Plus, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Project {
    id: string;
    name: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        // Mock fetching projects
        const storedProjects = localStorage.getItem("chat_platform_projects");
        if (storedProjects) {
            setProjects(JSON.parse(storedProjects));
        }
    }, []);

    const createProject = () => {
        const newProject: Project = {
            id: crypto.randomUUID(),
            name: `My Project ${projects.length + 1}`,
            createdAt: new Date().toISOString(),
        };
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        localStorage.setItem("chat_platform_projects", JSON.stringify(updatedProjects));
        router.push(`/project/${newProject.id}`);
    };

    if (loading || !user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
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
                                className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <MessageSquare className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Created {new Date(project.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
