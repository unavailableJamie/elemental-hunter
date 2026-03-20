
import React from 'react';
import { useImage } from '../hooks/useImage.ts';

interface ManagedImageProps {
    src: string;
    alt: string;
    className?: string;
}

export const ManagedImage: React.FC<ManagedImageProps> = ({ src, alt, className }) => {
    const { status } = useImage(src);

    if (status === 'loaded') {
        return <img src={src} alt={alt} className={className} />;
    }

    if (status === 'failed') {
        return (
            <div className={`${className} bg-gray-200 flex items-center justify-center border border-gray-300 rounded-full`}>
                <span className="text-xs text-gray-500" title={alt}>⚠️</span>
            </div>
        );
    }

    // status is 'loading'
    return <div className={`${className} bg-gray-200 animate-pulse rounded-full`}></div>;
};
