"use client";

import React from "react";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export default function Switch({ checked, onChange, label }: SwitchProps) {
    return (
        <div className="flex items-center justify-between py-3">
            {label && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}
        `}
            >
                <span
                    aria-hidden="true"
                    className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
                />
            </button>
        </div>
    );
}
