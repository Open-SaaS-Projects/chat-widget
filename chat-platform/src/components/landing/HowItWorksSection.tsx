"use client";

import { Check } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Customize your widget",
        description: "Use our visual editor to customize colors, text, and branding. See changes in real-time.",
    },
    {
        number: "02",
        title: "Preview in real-time",
        description: "Test your widget on desktop and mobile. Make sure it looks perfect before going live.",
    },
    {
        number: "03",
        title: "Copy embed code",
        description: "Get your unique embed code with all your customizations baked in.",
    },
    {
        number: "04",
        title: "Deploy to your site",
        description: "Paste the code into your website and you're live. It's that simple.",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6320CE]/10 rounded-full mb-4">
                        <span className="text-sm font-medium text-[#6320CE]">How it works</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Get started in{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6320CE] to-[#8B5CF6]">
                            4 simple steps
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        From customization to deployment, we've made it incredibly simple
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection line */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6320CE]/20 via-[#6320CE]/50 to-[#6320CE]/20 -translate-x-1/2"></div>

                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`relative flex flex-col lg:flex-row gap-8 items-center ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                    }`}
                            >
                                {/* Content */}
                                <div className={`flex-1 ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                                    <div className="inline-block">
                                        <div className="text-6xl font-bold text-[#6320CE]/10 mb-2">
                                            {step.number}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600 text-lg max-w-md">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Center circle */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#6320CE] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6320CE]/25">
                                        <Check className="h-8 w-8 text-white" />
                                    </div>
                                </div>

                                {/* Spacer for alignment */}
                                <div className="flex-1 hidden lg:block"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-20 text-center">
                    <a
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#6320CE] text-white rounded-lg hover:bg-[#7B3FE4] transition-all hover:scale-105 font-semibold shadow-xl shadow-[#6320CE]/25"
                    >
                        Start Building Your Widget
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
