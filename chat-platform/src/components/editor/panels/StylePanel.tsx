"use client";

import { useWidget } from "@/context/WidgetContext";
import ColorPicker from "@/components/ui/ColorPicker";

export default function StylePanel() {
    const { config, updateColors } = useWidget();

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Colors
                </h3>
                <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
                    <ColorPicker
                        label="Primary Color"
                        value={config.colors.primary}
                        onChange={(val) => updateColors({ primary: val })}
                    />
                    <ColorPicker
                        label="Header Background"
                        value={config.colors.header}
                        onChange={(val) => updateColors({ header: val })}
                    />
                    <ColorPicker
                        label="Chat Background"
                        value={config.colors.background}
                        onChange={(val) => updateColors({ background: val })}
                    />
                </div>
            </div>
        </div>
    );
}
