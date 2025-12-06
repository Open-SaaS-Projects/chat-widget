import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-cyan-50 dark:bg-cyan-900/30 border-2 border-cyan-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-cyan-500" />
            <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">API Call</div>
                <div className="ml-auto px-2 py-0.5 text-[10px] bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200 rounded">
                    Backend
                </div>
            </div>
            <div className="text-xs text-cyan-800 dark:text-cyan-200 font-mono truncate">
                {data.method || 'GET'} {data.url || 'No URL'}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-cyan-500" />
        </div>
    );
});
