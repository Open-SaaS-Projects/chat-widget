import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-green-50 dark:bg-green-900/30 border-2 border-green-500">
            <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-700 dark:text-green-300" />
                <div className="text-sm font-semibold text-green-900 dark:text-green-100">Start</div>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-green-500" />
        </div>
    );
});
