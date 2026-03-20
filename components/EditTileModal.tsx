
import React, { useState, useEffect, useMemo } from 'react';
import type { TileData, PlayerID, Connection, ConnectionCondition } from '../types.ts';
import { TileType } from '../types.ts';

interface ConnectionEditorProps {
    tileId: number;
    connections: Connection[];
    allTileIds: number[];
    onUpdate: (newConnections: Connection[]) => void;
}

const ConnectionEditor: React.FC<ConnectionEditorProps> = ({ connections, allTileIds, onUpdate }) => {
    
    const handleUpdateConnection = (index: number, field: keyof Connection | keyof ConnectionCondition, value: string | number) => {
        const newConnections = JSON.parse(JSON.stringify(connections));
        if (field === 'to') {
            newConnections[index].to = parseInt(value, 10);
        } else if (field === 'isPlayer' || field === 'isNotPlayer') {
            if (!newConnections[index].condition) {
                newConnections[index].condition = {};
            }
            if (value === 'none') {
                 delete newConnections[index].condition[field];
                 if(Object.keys(newConnections[index].condition).length === 0) {
                    delete newConnections[index].condition;
                 }
            } else {
                newConnections[index].condition[field] = value;
            }
        }
        onUpdate(newConnections);
    };

    const handleAddConnection = () => {
        const newConnection: Connection = { to: allTileIds[0] || 0 };
        onUpdate([...connections, newConnection]);
    };

    const handleRemoveConnection = (index: number) => {
        onUpdate(connections.filter((_, i) => i !== index));
    };
    
    return (
        <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Connections from this Tile</h3>
            {connections.map((conn, index) => (
                <div key={index} className="p-2 border rounded-md space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                         <label className="text-sm font-medium text-gray-700">To Tile:</label>
                         <select
                            value={conn.to}
                            onChange={(e) => handleUpdateConnection(index, 'to', e.target.value)}
                            className="w-2/3 pl-2 pr-8 py-1 text-sm border-gray-300 rounded-md"
                        >
                            {allTileIds.map(id => <option key={id} value={id}>{id}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Condition: Player IS</label>
                        <select
                            value={conn.condition?.isPlayer || 'none'}
                            onChange={(e) => handleUpdateConnection(index, 'isPlayer', e.target.value)}
                            className="w-2/3 pl-2 pr-8 py-1 text-sm border-gray-300 rounded-md"
                        >
                            <option value="none">Anyone</option>
                            <option value="Player1">Player 1</option>
                            <option value="Player2">Player 2</option>
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => handleRemoveConnection(index)} className="text-sm text-red-600 hover:text-red-800">
                            Remove Connection
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={handleAddConnection} className="w-full mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg text-sm">
                Add New Connection
            </button>
        </div>
    );
};


interface EditTileModalProps {
    tile: TileData;
    onUpdateTile: (updatedTile: TileData) => void;
    onClose: () => void;
    onDelete: (tileId: number) => void;
    onUpdateConnections: (newConnections: Record<number, Connection[]>) => void;
    connections: Record<number, Connection[]>;
    allTileIds: number[];
}

export const EditTileModal: React.FC<EditTileModalProps> = ({ tile, onUpdateTile, onClose, onDelete, onUpdateConnections, connections, allTileIds }) => {
    const [type, setType] = useState<TileType>(tile.type);
    const [diamondValue, setDiamondValue] = useState<number>(tile.diamondValue || 0);
    const [owner, setOwner] = useState<PlayerID | 'none'>(tile.owner || 'none');
    const [direction, setDirection] = useState<0|90|180|270>(tile.direction ?? 0);
    const [tileConnections, setTileConnections] = useState<Connection[]>(connections[tile.id] || []);

    useEffect(() => {
        setType(tile.type);
        setDiamondValue(tile.diamondValue || 0);
        setOwner(tile.owner || 'none');
        setDirection(tile.direction ?? 0);
        setTileConnections(connections[tile.id] || []);
    }, [tile, connections]);

    const handleSave = () => {
        const updatedTile: TileData = {
            ...tile,
            type,
            diamondValue: diamondValue > 0 ? diamondValue : undefined,
            owner: owner !== 'none' ? owner : undefined,
            direction: type === TileType.Ladder ? direction : undefined,
        };
        if (type !== TileType.SafeZone && type !== TileType.Ladder) {
            delete updatedTile.owner;
        }
        onUpdateTile(updatedTile);

        const newAllConnections = { ...connections };
        if (tileConnections.length > 0) {
            newAllConnections[tile.id] = tileConnections;
        } else {
            delete newAllConnections[tile.id]; // Clean up if no connections
        }
        onUpdateConnections(newAllConnections);

        onClose(); // Close modal on save
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete tile #${tile.id}? This action cannot be undone.`)) {
            onDelete(tile.id);
        }
    };
    
    const sortedAllTileIds = useMemo(() => [...allTileIds].sort((a,b) => a-b), [allTileIds]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Tile #{tile.id}</h2>

                <div>
                    <label htmlFor="tile-type" className="block text-sm font-medium text-gray-700">Tile Type</label>
                    <select id="tile-type" value={type} onChange={(e) => setType(e.target.value as TileType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        {Object.values(TileType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="diamond-value" className="block text-sm font-medium text-gray-700">Diamond Value</label>
                    <input type="number" id="diamond-value" value={diamondValue} onChange={(e) => setDiamondValue(parseInt(e.target.value, 10) || 0)} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" min="0" />
                </div>
                
                {(type === TileType.Ladder) && (
                     <div>
                        <label htmlFor="tile-direction" className="block text-sm font-medium text-gray-700">Ladder Direction (degrees)</label>
                        <select id="tile-direction" value={direction} onChange={(e) => setDirection(parseInt(e.target.value, 10) as 0|90|180|270)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                           <option value="0">0 (Up)</option>
                           <option value="90">90 (Right)</option>
                           <option value="180">180 (Down)</option>
                           <option value="270">270 (Left)</option>
                        </select>
                    </div>
                )}

                {(type === TileType.SafeZone || type === TileType.Ladder) && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700">Owner</h3>
                        <fieldset className="mt-2">
                            <div className="flex items-center space-x-4">
                                {['none', 'Player1', 'Player2'].map((option) => (
                                    <div key={option} className="flex items-center">
                                        <input id={`owner-${option}`} name="owner-selection" type="radio" checked={owner === option} onChange={() => setOwner(option as PlayerID | 'none')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                                        <label htmlFor={`owner-${option}`} className="ml-2 block text-sm text-gray-900 capitalize">{option}</label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                )}
                
                <ConnectionEditor
                    tileId={tile.id}
                    connections={tileConnections}
                    allTileIds={sortedAllTileIds}
                    onUpdate={setTileConnections}
                />

                <div className="flex justify-between items-center pt-4">
                    <button onClick={handleDelete} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors">
                        Delete Tile
                    </button>
                    <div className="flex justify-end gap-4">
                        <button onClick={onClose} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
