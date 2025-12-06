import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { StopCircle } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-red-50 dark:bg-red-900/30 border-2 border-red-500">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-red-500" />
            <div className="flex items-center gap-2">
                <StopCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                <div className="text-sm font-semibold text-red-900 dark:text-red-100">End</div>
            </div>
        </div>
    );
});
