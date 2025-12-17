import React, { useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertyContext';
import { User } from '../types';
import PropertyAssignmentModal from './PropertyAssignmentModal';

const AgentsPage: React.FC = () => {
    const { users } = useAuth();
    const { properties } = useProperties();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // We'll consider users with role 'user' as agents for this module
    const agents = users.filter(u => u.role === 'user' || u.role === 'agent');

    const filteredAgents = useMemo(() => {
        if (!searchQuery) {
            return agents;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return agents.filter(agent =>
            (agent.name || '').toLowerCase().includes(lowercasedQuery) ||
            agent.username.toLowerCase().includes(lowercasedQuery)
        );
    }, [agents, searchQuery]);

    const handleManagePortfolio = (agent: User) => {
        setSelectedAgent(agent);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAgent(null);
    };

    return (
        <>
            <section className="py-16 md:py-24 bg-gray-100 min-h-[70vh]">
                <div className="container mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark mb-8 text-center">Gestión de Agentes</h2>
                    
                    <div className="mb-10 max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="Buscar agente por nombre o usuario..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-inverland-green focus:border-transparent bg-white text-gray-800"
                            aria-label="Buscar agente"
                        />
                    </div>

                    {agents.length > 0 ? (
                        filteredAgents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {filteredAgents.map(agent => {
                                    const agentProperties = properties.filter(p => p.agentId === agent.id);
                                    return (
                                        <div key={agent.id} className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col">
                                            <div className="flex-grow">
                                                <div className="flex items-center mb-4">
                                                    <div className="w-16 h-16 rounded-full bg-inverland-green text-white flex items-center justify-center text-2xl font-bold mr-4 flex-shrink-0">
                                                        {agent.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-inverland-dark">{agent.name || agent.username}</h3>
                                                        <p className="text-gray-500 capitalize">{agent.role}</p>
                                                    </div>
                                                </div>
                                                <div className="border-t pt-4">
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Propiedades asignadas:</strong> {agentProperties.length}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleManagePortfolio(agent)}
                                                className="mt-6 w-full bg-inverland-dark text-white font-bold py-3 rounded-md hover:bg-inverland-blue transition-colors duration-300"
                                            >
                                                Administrar Portafolio
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                             <div className="text-center py-16 bg-white rounded-lg shadow-md">
                                <h3 className="text-2xl font-semibold text-gray-700">No se encontraron agentes</h3>
                                <p className="text-gray-500 mt-2">Intenta con otro término de búsqueda.</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-md">
                            <h3 className="text-2xl font-semibold text-gray-700">No hay agentes registrados</h3>
                            <p className="text-gray-500 mt-2">Crea nuevos usuarios desde el panel de administración para poder asignarles propiedades.</p>
                        </div>
                    )}
                </div>
            </section>
            
            {isModalOpen && selectedAgent && (
                <PropertyAssignmentModal agent={selectedAgent} onClose={handleCloseModal} />
            )}
        </>
    );
};

export default AgentsPage;