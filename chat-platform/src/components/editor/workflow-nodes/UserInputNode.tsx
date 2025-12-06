import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Keyboard } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-purple-500" />
            <div className="flex items-center gap-2 mb-2">
                <Keyboard className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">User Input</div>
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-200">
                {data.prompt || 'Waiting for input...'}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-purple-500" />
        </div>
    );
});
