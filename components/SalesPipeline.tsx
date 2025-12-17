import React, { useState } from 'react';
import { Property, User, Client } from '../types';

interface SalesPipelineProps {
    properties: Property[];
    users: User[];
    clients: Client[];
    onAssignClient: (property: Property) => void;
    updateProperty: (property: Property) => void;
}

const SalesPipeline: React.FC<SalesPipelineProps> = ({ properties, users, clients, onAssignClient, updateProperty }) => {
    const pipelineStages: Property['pipelineStage'][] = ['Lead', 'Contactado', 'Visita Agendada', 'Negociación', 'Cerrado'];
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<Property['pipelineStage'] | null>(null);

    const getAgentName = (agentId: string | null | undefined) => {
        if (!agentId) return 'No asignado';
        const agent = users.find(u => u.id === agentId);
        return agent?.name || agent?.username || 'Desconocido';
    };

    const getClientName = (clientId: string | null | undefined) => {
        if (!clientId) return null;
        const client = clients.find(c => c.id === clientId);
        return client?.name || null;
    }
    
    const formatPrice = (price: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(price);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, stage: NonNullable<Property['pipelineStage']>) => {
        const propertyId = e.dataTransfer.getData('propertyId');
        setDragOverStage(null);
        setDraggedItemId(null);

        const propertyToMove = properties.find(p => p.id === propertyId);
        if (propertyToMove && propertyToMove.pipelineStage !== stage) {
            const updatedProperty: Property = { ...propertyToMove, pipelineStage: stage };
            
            if (stage === 'Cerrado') {
                updatedProperty.soldAt = new Date().toISOString();
                const agent = users.find(u => u.id === propertyToMove.agentId);
                if (agent && agent.commissionRate) {
                    updatedProperty.commissionAmount = propertyToMove.price * agent.commissionRate;
                }
            } else {
                // Clear commission fields if moved out of "Cerrado"
                updatedProperty.soldAt = undefined;
                updatedProperty.commissionAmount = undefined;
            }
            
            updateProperty(updatedProperty);
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex space-x-4 min-w-max">
                {pipelineStages.map(stage => {
                    const stageProperties = properties.filter(p => p.pipelineStage === stage);
                    const totalValue = stageProperties.reduce((sum, prop) => sum + prop.price, 0);

                    return (
                        <div 
                            key={stage} 
                            className={`rounded-lg w-72 lg:w-80 flex-shrink-0 flex flex-col transition-colors duration-200 ${dragOverStage === stage ? 'bg-inverland-blue/10' : 'bg-gray-100'}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
                            onDragLeave={() => setDragOverStage(null)}
                            onDrop={(e) => handleDrop(e, stage!)}
                        >
                            <div className="p-3 border-b bg-white rounded-t-lg sticky top-0 z-10">
                                <h4 className="text-md font-bold text-inverland-dark flex justify-between items-center">
                                    <span>{stage}</span>
                                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">{stageProperties.length}</span>
                                </h4>
                                <p className="text-xs text-gray-500 font-medium mt-1">{formatPrice(totalValue)}</p>
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto h-[60vh] flex-grow">
                                {stageProperties.length > 0 ? stageProperties.map(prop => {
                                    const clientName = getClientName(prop.clientId);
                                    return (
                                        <div 
                                            key={prop.id} 
                                            draggable="true"
                                            onDragStart={(e) => { e.dataTransfer.setData('propertyId', prop.id); setDraggedItemId(prop.id); }}
                                            onDragEnd={() => setDraggedItemId(null)}
                                            className={`bg-white p-3 rounded-md shadow-sm border cursor-grab ${draggedItemId === prop.id ? 'opacity-50 ring-2 ring-inverland-green' : ''}`}
                                        >
                                            <p className="font-semibold text-gray-800 text-sm truncate">{prop.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{prop.location}</p>
                                            <p className="text-sm font-bold text-inverland-green mt-1">{formatPrice(prop.price)}</p>
                                            
                                            {stage === 'Cerrado' && prop.commissionAmount && (
                                                <div className="text-xs font-medium text-green-700 bg-green-50 p-2 rounded mt-2">
                                                    <strong>Comisión:</strong> {formatPrice(prop.commissionAmount)}
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-500 mt-2 border-t pt-2 space-y-1">
                                                <p><span className="font-medium">Agente:</span> {getAgentName(prop.agentId)}</p>
                                                <div className="flex items-center">
                                                    <p className="font-medium mr-1">Cliente:</p>
                                                    <button onClick={() => onAssignClient(prop)} className={`text-left text-xs font-semibold py-0.5 px-1.5 rounded ${clientName ? 'text-inverland-blue bg-blue-50 hover:bg-blue-100' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>
                                                        {clientName || 'Asignar Cliente'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                     <div className="text-center text-sm text-gray-400 p-4 h-full flex items-center justify-center">
                                        Arrastra una propiedad aquí.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SalesPipeline;
