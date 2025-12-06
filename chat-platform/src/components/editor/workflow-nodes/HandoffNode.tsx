import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { UserPlus } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-orange-500" />
            <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">Handoff</div>
                <div className="ml-auto px-2 py-0.5 text-[10px] bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded">
                    Backend
                </div>
            </div>
            <div className="text-xs text-orange-800 dark:text-orange-200">
                To: {data.target || 'human'}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-orange-500" />
        </div>
    );
});
