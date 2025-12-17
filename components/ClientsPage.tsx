import React, { useState, useMemo } from 'react';
import { useClients } from './ClientContext';
import { useAuth } from './AuthContext';
import { Client } from '../types';
import ClientFormModal from './ClientFormModal'; // Import the new modal

const ClientsPage: React.FC = () => {
    const { clients, deleteClient } = useClients(); // Get deleteClient function
    const { users } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };
    
    const handleDeleteClient = (clientId: string, clientName: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${clientName}? Esta acción no se puede deshacer.`)) {
            deleteClient(clientId);
        }
    };


    const agents = useMemo(() => users.filter(u => u.role === 'agent' || u.role === 'admin'), [users]);
    const getAgentName = (agentId: string | undefined) => {
        if (!agentId) return <span className="text-gray-400 italic">No asignado</span>;
        const agent = agents.find(a => a.id === agentId);
        return agent?.name || agent?.username || 'Desconocido';
    };

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  client.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter ? client.status === statusFilter : true;
            return matchesSearch && matchesStatus;
        });
    }, [clients, searchTerm, statusFilter]);

    const clientStatuses: Client['status'][] = ['Lead', 'Contactado', 'Activo', 'En espera', 'Descartado'];
    
    const getStatusBadge = (status: Client['status']) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'Lead': return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'Contactado': return `${baseClasses} bg-indigo-100 text-indigo-800`;
            case 'Activo': return `${baseClasses} bg-green-100 text-green-800`;
            case 'En espera': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'Descartado': return `${baseClasses} bg-gray-100 text-gray-800`;
            default: return `${baseClasses} bg-gray-200 text-gray-800`;
        }
    };


    return (
        <>
            <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark mb-4 md:mb-0">
                            Gestión de Clientes
                        </h2>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="w-full md:w-auto bg-inverland-green text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-transform duration-300 transform hover:scale-105 shadow-md"
                        >
                            Añadir Cliente
                        </button>
                    </div>

                    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-inverland-green focus:border-inverland-green bg-white text-gray-800"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-inverland-green focus:border-inverland-green bg-white text-gray-800"
                            >
                                <option value="">Todos los Estatus</option>
                                {clientStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agente Asignado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClients.length > 0 ? filteredClients.map(client => (
                                        <tr key={client.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{client.email}</div>
                                                <div className="text-sm text-gray-500">{client.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(client.status)}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                {getAgentName(client.assignedAgentId)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleOpenModal(client)} className="text-inverland-blue hover:text-inverland-dark mr-4">Editar</button>
                                                <button onClick={() => handleDeleteClient(client.id, client.name)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                            </td>
                                        </tr>
                                    )) : null}
                                </tbody>
                            </table>
                            {filteredClients.length === 0 && (
                                 <div className="text-center py-10">
                                    <h3 className="text-lg font-semibold text-gray-700">No se encontraron clientes</h3>
                                    <p className="text-gray-500 mt-1">Intenta ajustar tu búsqueda o filtros.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            <ClientFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                clientToEdit={editingClient}
            />
        </>
    );
};

export default ClientsPage;