import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-500" />
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">Message</div>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-200 break-words">
                {data.message || 'No message set'}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-500" />
        </div>
    );
});
