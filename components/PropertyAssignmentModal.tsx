import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useProperties } from './PropertyContext';

interface PropertyAssignmentModalProps {
    agent: User;
    onClose: () => void;
}

const PropertyAssignmentModal: React.FC<PropertyAssignmentModalProps> = ({ agent, onClose }) => {
    const { properties, assignPropertiesToAgent } = useProperties();
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    
    useEffect(() => {
        // Pre-select properties already assigned to this agent
        const assignedIds = properties
            .filter(p => p.agentId === agent.id)
            .map(p => p.id);
        setSelectedPropertyIds(assignedIds);
    }, [agent, properties]);

    const handleCheckboxChange = (propertyId: string) => {
        setSelectedPropertyIds(prev =>
            prev.includes(propertyId)
                ? prev.filter(id => id !== propertyId)
                : [...prev, propertyId]
        );
    };

    const handleSave = () => {
        assignPropertiesToAgent(agent.id, selectedPropertyIds);
        onClose();
    };
    
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 md:p-6 border-b">
                    <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-inverland-dark">
                        Asignar a <span className="text-inverland-green">{agent.name || agent.username}</span>
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">Selecciona las propiedades para este agente.</p>
                </div>

                {/* Property List */}
                <div className="p-4 md:p-6 overflow-y-auto flex-grow">
                    <div className="space-y-4">
                        {properties.length > 0 ? properties.map(prop => (
                            <div key={prop.id} className="flex items-center p-2 sm:p-3 border rounded-md hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    id={`prop-${prop.id}`}
                                    checked={selectedPropertyIds.includes(prop.id)}
                                    onChange={() => handleCheckboxChange(prop.id)}
                                    className="h-5 w-5 text-inverland-green border-gray-300 rounded focus:ring-inverland-green"
                                />
                                <label htmlFor={`prop-${prop.id}`} className="ml-4 flex-grow cursor-pointer">
                                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{prop.title}</p>
                                    <p className="text-sm text-gray-500">{prop.location} - <span className="font-medium">{formatPrice(prop.price)}</span></p>
                                    {prop.agentId && prop.agentId !== agent.id && (
                                        <p className="text-xs text-yellow-600">Actualmente asignada a otro agente.</p>
                                    )}
                                </label>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center">No hay propiedades disponibles para asignar.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-inverland-green text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyAssignmentModal;