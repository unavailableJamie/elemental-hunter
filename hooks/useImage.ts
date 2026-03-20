
import { useState, useEffect } from 'react';

type ImageStatus = 'loading' | 'loaded' | 'failed';

export const useImage = (src: string): { status: ImageStatus } => {
    const [status, setStatus] = useState<ImageStatus>('loading');

    useEffect(() => {
        if (!src) {
            setStatus('failed');
            return;
        }

        const img = new Image();
        img.src = src;

        const handleLoad = () => {
            setStatus('loaded');
        };

        const handleError = () => {
            setStatus('failed');
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);

        // Cleanup function
        return () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
        };
    }, [src]);

    return { status };
};
