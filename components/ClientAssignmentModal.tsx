import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { useClients } from './ClientContext';
import { useProperties } from './PropertyContext';

interface ClientAssignmentModalProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

const ClientAssignmentModal: React.FC<ClientAssignmentModalProps> = ({ property, isOpen, onClose }) => {
    const { clients } = useClients();
    const { assignClientToProperty } = useProperties();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(property.clientId || null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        return clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [clients, searchTerm]);

    const handleSave = () => {
        assignClientToProperty(property.id, selectedClientId);
        onClose();
    };

    const handleUnlink = () => {
        setSelectedClientId(null);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
                {/* Header */}
                <div className="p-5 border-b">
                    <h2 id="modal-title" className="text-xl font-bold text-inverland-dark">
                        Asignar Cliente a:
                    </h2>
                    <p className="text-inverland-green font-semibold truncate">{property.title}</p>
                </div>

                {/* Search and List */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-inverland-green focus:border-inverland-green bg-white text-gray-800 mb-4"
                    />
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {filteredClients.length > 0 ? filteredClients.map(client => (
                            <div key={client.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors">
                                <input
                                    type="radio"
                                    id={`client-${client.id}`}
                                    name="clientSelection"
                                    checked={selectedClientId === client.id}
                                    onChange={() => setSelectedClientId(client.id)}
                                    className="h-4 w-4 text-inverland-green border-gray-300 focus:ring-inverland-green"
                                />
                                <label htmlFor={`client-${client.id}`} className="ml-3 flex-grow cursor-pointer text-sm font-medium text-gray-800">
                                    {client.name}
                                </label>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center text-sm py-4">No se encontraron clientes.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-2 rounded-b-lg">
                    <button 
                        onClick={handleUnlink}
                        disabled={!selectedClientId}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 font-semibold rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Desvincular Cliente
                    </button>
                    <div className="flex space-x-2">
                         <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-inverland-green text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientAssignmentModal;