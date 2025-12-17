import React, { useState, useEffect } from 'react';

interface SyncStatusProps {
    isOnline: boolean;
    lastSync?: Date;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isOnline, lastSync }) => {
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        // Mostrar el estado por 3 segundos cuando cambie
        setShowStatus(true);
        const timer = setTimeout(() => setShowStatus(false), 3000);
        return () => clearTimeout(timer);
    }, [isOnline, lastSync]);

    if (!showStatus) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
                isOnline 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
                <div className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                    {isOnline ? 'Conectado a Firebase' : 'Modo Offline'}
                </span>
                {lastSync && (
                    <span className="text-xs text-gray-600">
                        Última sincronización: {lastSync.toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SyncStatus;
