
import React, { useEffect, useRef, useState } from 'react';

interface GameLogProps {
    logs: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (scrollRef.current && !isCollapsed) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isCollapsed]);

    // Standard tailwind w-80 is 320px. User requested exactly 27px reduction.
    // 320 - 27 = 293px.
    const expandedWidth = 260;
    const collapsedWidth = 92; // Enough for "History" and the icon

    return (
        <div 
            className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ 
                width: isCollapsed ? `${collapsedWidth}px` : `${expandedWidth}px`,
                transition: 'width 0.2s ease'
            }}
        >
            <div className={`flex items-center justify-between ${isCollapsed ? 'mb-0' : 'mb-3 border-b border-white/5 pb-2'}`}>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest truncate">
                    {isCollapsed ? 'History' : 'Action History'}
                </h3>
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white transition-colors px-1 leading-none text-lg select-none outline-none focus:ring-1 focus:ring-white/20 rounded"
                    aria-label={isCollapsed ? "Expand History" : "Collapse History"}
                >
                    {isCollapsed ? '▸' : '▾'}
                </button>
            </div>
            
            <div 
                ref={scrollRef}
                className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide pr-1"
                style={{ 
                    opacity: isCollapsed ? 0 : 1,
                    pointerEvents: isCollapsed ? 'none' : 'auto',
                    height: isCollapsed ? 0 : 'auto',
                    transition: 'opacity 0.15s ease'
                }}
            >
                {logs.length === 0 ? (
                    <p className="text-xs text-gray-600 italic">No actions yet...</p>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="text-[11px] leading-relaxed text-gray-300 font-medium">
                            <span className="text-white/20 mr-2 font-mono">{(i + 1).toString().padStart(2, '0')}</span>
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
