"use client";

import { Palette, Zap, Code2 } from "lucide-react";

const features = [
    {
        icon: Palette,
        title: "Easy Customization",
        description: "Visual editor with live preview. Customize colors, text, and branding without touching code.",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Zap,
        title: "Beautiful Design",
        description: "Pre-built themes and custom branding options. Create widgets that match your brand perfectly.",
        gradient: "from-[#6320CE] to-[#8B5CF6]",
    },
    {
        icon: Code2,
        title: "Quick Integration",
        description: "Simple embed code for any website. Copy, paste, and you're live in seconds.",
        gradient: "from-blue-500 to-cyan-500",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6320CE]/10 rounded-full mb-4">
                        <span className="text-sm font-medium text-[#6320CE]">Features</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        The complete platform for{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6320CE] to-[#8B5CF6]">
                            chat widgets
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to create and deploy beautiful chat widgets for your website
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-[#6320CE]/20 transition-all hover:shadow-xl hover:shadow-[#6320CE]/10 hover:-translate-y-1"
                            >
                                {/* Icon */}
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Decorative gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Section */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-[#6320CE] mb-2">5 min</div>
                        <div className="text-gray-600">Setup Time</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-[#6320CE] mb-2">100%</div>
                        <div className="text-gray-600">Customizable</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-[#6320CE] mb-2">0</div>
                        <div className="text-gray-600">Coding Required</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-[#6320CE] mb-2">∞</div>
                        <div className="text-gray-600">Possibilities</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
