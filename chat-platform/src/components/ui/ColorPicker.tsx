"use client";

import React from "react";

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 uppercase font-mono">{value}</span>
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                    />
                </div>
            </div>
        </div>
    );
}
