import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

export default memo(({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500 min-w-[200px]">
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-indigo-500" />
            <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
                <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">AI Agent</div>
                <div className="ml-auto px-2 py-0.5 text-[10px] bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded">
                    Backend
                </div>
            </div>
            <div className="text-xs text-indigo-800 dark:text-indigo-200">
                {data.useKnowledgeBase ? 'With knowledge base' : 'Direct LLM'}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-indigo-500" />
        </div>
    );
});
