import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";

export default function LandingPage() {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-br from-[#6320CE] to-[#8B5CF6] relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join thousands of businesses using custom chat widgets to engage with their customers
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/signup"
                            className="px-8 py-4 bg-white text-[#6320CE] rounded-lg hover:bg-gray-50 transition-all hover:scale-105 font-semibold shadow-xl flex items-center justify-center gap-2"
                        >
                            Start Building Free
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>

                        <a
                            href="/login"
                            className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border-2 border-white/30 font-semibold flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            Sign In
                        </a>
                    </div>

                    <p className="mt-6 text-white/80 text-sm">
                        No credit card required • Free forever plan available
                    </p>
                </div>
            </section>
        </>
    );
}
