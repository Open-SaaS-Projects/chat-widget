"use client";

import { WidgetProvider } from "@/context/WidgetContext";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WidgetProvider>{children}</WidgetProvider>;
}
