import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    const conditionCount = data.conditions?.length || 0;

    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-yellow-500" />
            <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Condition</div>
            </div>
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
                {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-yellow-500" />
        </div>
    );
});
