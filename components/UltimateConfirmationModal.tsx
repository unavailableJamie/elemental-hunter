
import React from 'react';
import { DiceIcon, PortalIcon } from './Icons.tsx';

export type UltimateType = 'extraRoll' | 'teleport';

interface UltimateConfirmationModalProps {
    type: UltimateType;
    onConfirm: () => void;
    onCancel: () => void;
}

const ULTIMATE_DETAILS = {
    extraRoll: {
        title: 'Extra Roll',
        icon: DiceIcon,
        description: 'Spend 100 SP to gain an additional dice roll this turn.',
        color: 'text-indigo-400'
    },
    teleport: {
        title: 'Teleport',
        icon: PortalIcon,
        description: 'Spend 100 SP to teleport your most valuable horse back to a Start Tile.',
        color: 'text-indigo-400'
    }
};

export const UltimateConfirmationModal: React.FC<UltimateConfirmationModalProps> = ({ type, onConfirm, onCancel }) => {
    const details = ULTIMATE_DETAILS[type];
    const Icon = details.icon;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
            <div className="bg-gray-900 border-2 border-indigo-500 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center border border-indigo-500/50 animate-pulse">
                        <Icon className="w-10 h-10 text-indigo-400" />
                    </div>
                    
                    <div className="space-y-1">
                        <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${details.color}`}>
                            {details.title}
                        </h2>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            {details.description}
                        </p>
                    </div>

                    <div className="w-full pt-4 space-y-3">
                        <button 
                            onClick={onConfirm}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl uppercase tracking-tighter shadow-lg transition-all active:scale-95"
                        >
                            Use (100 SP)
                        </button>
                        <button 
                            onClick={onCancel}
                            className="w-full bg-transparent hover:bg-white/5 text-gray-400 font-black py-3 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
