
import React from 'react';
import type { TileData } from '../types.ts';

interface AddTokenModalProps {
    safeZones: TileData[];
    onSelect: (tileId: number) => void;
    onClose: () => void;
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({ safeZones, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Choose a Safe Zone</h2>
                <p className="text-gray-600">Select a tile to place your new token.</p>
                <div className="space-y-3 pt-2">
                    {safeZones.map(zone => (
                        <button
                            key={zone.id}
                            onClick={() => onSelect(zone.id)}
                            className="w-full p-3 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors"
                        >
                            Place at Safe Zone #{zone.id}
                        </button>
                    ))}
                </div>
                <div className="pt-4">
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
