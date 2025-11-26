"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    signup: (email: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem("chat_platform_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string) => {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser = {
            id: "1",
            email,
            name: email.split("@")[0],
        };

        setUser(mockUser);
        localStorage.setItem("chat_platform_user", JSON.stringify(mockUser));
        setLoading(false);
        router.push("/dashboard");
    };

    const signup = async (email: string, name: string) => {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser = {
            id: "1",
            email,
            name,
        };

        setUser(mockUser);
        localStorage.setItem("chat_platform_user", JSON.stringify(mockUser));
        setLoading(false);
        router.push("/dashboard");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("chat_platform_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
