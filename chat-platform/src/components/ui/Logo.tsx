import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Logo() {
    return (
        <Link href="/home" className="flex items-center gap-3 group">
            <div className="bg-[#6320CE] p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <MessageSquare className="h-6 w-6 text-white fill-current" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Chat Widget
                </span>
                <span className="bg-[#6320CE]/10 text-[#6320CE] text-xs font-semibold px-2 py-0.5 rounded-full">
                    by MAKKN
                </span>
            </div>
        </Link>
    );
}
