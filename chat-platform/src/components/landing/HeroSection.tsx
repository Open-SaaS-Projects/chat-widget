"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-20 sm:py-32">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6320CE]/10 rounded-full mb-6">
                            <Sparkles className="h-4 w-4 text-[#6320CE]" />
                            <span className="text-sm font-medium text-[#6320CE]">
                                No coding required
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Build Custom{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6320CE] to-[#8B5CF6]">
                                Chat Widgets
                            </span>{" "}
                            for Your Website
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                            Create, customize, and deploy beautiful chat widgets in minutes.
                            No technical skills required—just point, click, and publish.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href="/signup"
                                className="group px-8 py-4 bg-[#6320CE] text-white rounded-lg hover:bg-[#7B3FE4] transition-all hover:scale-105 font-semibold shadow-xl shadow-[#6320CE]/25 flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a
                                href="#how-it-works"
                                className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border-2 border-gray-200 font-semibold flex items-center justify-center gap-2"
                            >
                                See How It Works
                            </a>
                        </div>

                        <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Free to start</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No credit card</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Animated Widget Preview */}
                    <div className="relative">
                        <div className="relative z-10">
                            {/* Browser mockup */}
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                                {/* Browser header */}
                                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                                    <div className="flex gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 text-center">
                                            yourwebsite.com
                                        </div>
                                    </div>
                                </div>

                                {/* Browser content with widget */}
                                <div className="bg-gradient-to-br from-gray-50 to-white p-8 h-96 relative">
                                    {/* Mock website content */}
                                    <div className="space-y-3 opacity-20">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-32 bg-gray-200 rounded mt-4"></div>
                                    </div>

                                    {/* Chat Widget */}
                                    <div
                                        className="absolute bottom-6 right-6 transition-all duration-500"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        {isHovered && (
                                            <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                                                <div className="bg-[#6320CE] p-4 text-white">
                                                    <h3 className="font-semibold">Chat Widget</h3>
                                                    <p className="text-xs text-white/80">Online</p>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                                        <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 text-sm">
                                                            Hi! How can I help you?
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button className="h-14 w-14 rounded-full bg-[#6320CE] shadow-lg hover:scale-110 transition-transform flex items-center justify-center group">
                                            <svg className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 h-72 w-72 bg-[#6320CE]/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-4 -left-4 h-72 w-72 bg-purple-300/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
