import { useState, useEffect } from 'react';

interface ConnectionStatus {
    isOnline: boolean;
    lastSync: Date | null;
}

export const useConnectionStatus = () => {
    const [status, setStatus] = useState<ConnectionStatus>({
        isOnline: navigator.onLine,
        lastSync: null
    });

    useEffect(() => {
        const handleOnline = () => {
            setStatus(prev => ({
                ...prev,
                isOnline: true,
                lastSync: new Date()
            }));
        };

        const handleOffline = () => {
            setStatus(prev => ({
                ...prev,
                isOnline: false
            }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateLastSync = () => {
        setStatus(prev => ({
            ...prev,
            lastSync: new Date()
        }));
    };

    return {
        ...status,
        updateLastSync
    };
};
