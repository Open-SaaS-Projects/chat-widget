"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function LandingNav() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6320CE] to-[#8B5CF6] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Chat Widget
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#6320CE]/10 text-[#6320CE] rounded-full font-medium">
                            by MAKKN
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-gray-600 hover:text-[#6320CE] transition-colors font-medium">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-gray-600 hover:text-[#6320CE] transition-colors font-medium">
                            How It Works
                        </a>
                        <a href="https://www.makkn.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#6320CE] transition-colors font-medium">
                            About MAKKN
                        </a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-gray-700 hover:text-[#6320CE] transition-colors font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2 bg-[#6320CE] text-white rounded-lg hover:bg-[#7B3FE4] transition-all hover:scale-105 font-medium shadow-lg shadow-[#6320CE]/25"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
