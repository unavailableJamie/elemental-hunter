
import React from 'react';

const Pip: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <div className="w-3 h-3 bg-black rounded-full" style={style}></div>
);

// A map to define pip positions using grid-area for a 3x3 grid
const pipGridPositions: { [key: number]: React.CSSProperties[] } = {
    1: [{ gridArea: '2 / 2' }],
    2: [{ gridArea: '1 / 1' }, { gridArea: '3 / 3' }],
    3: [{ gridArea: '1 / 1' }, { gridArea: '2 / 2' }, { gridArea: '3 / 3' }],
    4: [{ gridArea: '1 / 1' }, { gridArea: '1 / 3' }, { gridArea: '3 / 1' }, { gridArea: '3 / 3' }],
    5: [{ gridArea: '1 / 1' }, { gridArea: '1 / 3' }, { gridArea: '2 / 2' }, { gridArea: '3 / 1' }, { gridArea: '3 / 3' }],
    6: [{ gridArea: '1 / 1' }, { gridArea: '1 / 3' }, { gridArea: '2 / 1' }, { gridArea: '2 / 3' }, { gridArea: '3 / 1' }, { gridArea: '3 / 3' }],
};


export const Dice: React.FC<{ value: number }> = ({ value }) => {
    // Fallback to an empty array for invalid values to prevent crashes
    const pips = pipGridPositions[value] || [];

    return (
        <div className="w-16 h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-2 grid grid-cols-3 grid-rows-3 justify-items-center items-center">
            {pips.map((style, index) => (
                <Pip key={index} style={style} />
            ))}
        </div>
    );
};
