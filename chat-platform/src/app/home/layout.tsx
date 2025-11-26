import LandingNav from "@/components/landing/LandingNav";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <LandingNav />
            <main className="pt-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Chat Widget</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Create beautiful, customizable chat widgets for your website in minutes.
                            </p>
                            <p className="text-sm text-gray-500">
                                Powered by{" "}
                                <a
                                    href="https://www.makkn.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#6320CE] hover:underline font-medium"
                                >
                                    MAKKN
                                </a>
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#features" className="text-gray-600 hover:text-[#6320CE] transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#how-it-works" className="text-gray-600 hover:text-[#6320CE] transition-colors">
                                        How It Works
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="https://www.makkn.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-[#6320CE] transition-colors"
                                    >
                                        About MAKKN
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} MAKKN. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
