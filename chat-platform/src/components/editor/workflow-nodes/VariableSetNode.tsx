import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Variable } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-pink-50 dark:bg-pink-900/30 border-2 border-pink-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-pink-500" />
            <div className="flex items-center gap-2 mb-2">
                <Variable className="h-4 w-4 text-pink-700 dark:text-pink-300" />
                <div className="text-sm font-semibold text-pink-900 dark:text-pink-100">Set Variable</div>
            </div>
            <div className="text-xs text-pink-800 dark:text-pink-200 font-mono">
                {data.variableName || 'No variable'} = {data.value || '...'}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-pink-500" />
        </div>
    );
});
