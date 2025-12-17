
import React, { useMemo, useState } from 'react';
// FIX: Adjusted import paths for root directory
import { useAuth } from './components/AuthContext';
import { useProperties } from './components/PropertyContext';
import { useClients } from './components/ClientContext';
import { Property, Client } from './types';

type View = 'home' | 'login' | 'dashboard' | 'userPortal' | 'addProperty' | 'agents' | 'tracking' | 'userManagement' | 'clients' | 'marketing' | 'analytics' | 'agentClientDetail';

interface AgentPortalProps {
    onNavigate: (view: View) => void;
    onViewClient: (client: Client) => void;
    onViewProperty: (property: Property) => void;
    // FIX: Add selected items to props for highlighting
    selectedProperty?: Property | null;
    selectedClient?: Client | null;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 00-6.44 0A6 6 0 003 20v1h12z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v-2m0 2v.01M12 12a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0c0 1.105-1.343 2-3 2m3-2c0-1.105-1.343-2-3-2m0 0c-1.657 0-3 .895-3 2m0 0c0 1.105 1.343 2 3 2m0 0c1.657 0 3-.895 3-2m0 0c0-1.105-1.343-2-3-2" /></svg>;

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-inverland-green/10 text-inverland-green p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-inverland-dark">{value}</p>
        </div>
    </div>
);

const AgentPortal: React.FC<AgentPortalProps> = ({ onNavigate, onViewClient, onViewProperty, selectedProperty, selectedClient }) => {
    const { currentUser } = useAuth();
    const { properties } = useProperties();
    const { clients } = useClients();
    const [activeTab, setActiveTab] = useState<'properties' | 'clients'>('properties');
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value);

    const agentData = useMemo(() => {
        if (!currentUser) return null;

        const agentProperties = properties.filter(p => p.agentId === currentUser.id);
        const agentClients = clients.filter(c => c.assignedAgentId === currentUser.id);
        const activeClients = agentClients.filter(c => c.status === 'Activo');
        const soldProperties = agentProperties.filter(p => p.status === 'Sold');
        const salesValue = soldProperties.reduce((sum, p) => sum + p.price, 0);

        return {
            agentProperties,
            agentClients,
            kpis: {
                assignedProperties: agentProperties.length,
                activeClients: activeClients.length,
                soldProperties: soldProperties.length,
                salesValue: formatCurrency(salesValue),
            }
        };
    }, [currentUser, properties, clients]);

    if (!currentUser || !agentData) {
        return <p>Cargando...</p>;
    }

    const { agentProperties, agentClients, kpis } = agentData;

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
    
    const getPipelineStageColor = (stage: Property['pipelineStage']) => {
        switch (stage) {
            case 'Lead': return 'bg-blue-500';
            case 'Contactado': return 'bg-indigo-500';
            case 'Visita Agendada': return 'bg-purple-500';
            case 'Negociación': return 'bg-yellow-500';
            case 'Cerrado': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark mb-4">
                    Portal de Agente
                </h2>
                <p className="text-lg text-gray-600 mb-12">¡Bienvenido, {currentUser.name || currentUser.username}!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
                    <KpiCard title="Propiedades Asignadas" value={kpis.assignedProperties.toString()} icon={<HomeIcon />} />
                    <KpiCard title="Clientes Activos" value={kpis.activeClients.toString()} icon={<UsersIcon />} />
                    <KpiCard title="Propiedades Vendidas" value={kpis.soldProperties.toString()} icon={<CheckBadgeIcon />} />
                    <KpiCard title="Valor de Ventas" value={kpis.salesValue} icon={<BanknotesIcon />} />
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('properties')} className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'properties' ? 'border-b-2 border-inverland-green text-inverland-green' : 'text-gray-500 hover:text-gray-700'}`}>
                                Mis Propiedades
                            </button>
                            <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 font-medium text-sm rounded-t-md ${activeTab === 'clients' ? 'border-b-2 border-inverland-green text-inverland-green' : 'text-gray-500 hover:text-gray-700'}`}>
                                Mis Clientes
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'properties' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                            {agentProperties.length > 0 ? agentProperties.map(prop => {
                                // FIX: Add conditional styling for selected property.
                                const isSelected = prop.id === selectedProperty?.id;
                                return (
                                <div 
                                    key={prop.id} 
                                    onClick={() => onViewProperty(prop)} 
                                    className={`rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 ${isSelected ? 'border-2 border-inverland-green ring-2 ring-inverland-green/30' : 'border border-gray-200'}`}
                                >
                                    <img src={(prop.images[0] && (prop.images[0].startsWith('http') || prop.images[0].startsWith('data:') || prop.images[0].startsWith('blob:'))) ? prop.images[0] : 'https://picsum.photos/600/400?grayscale'} alt={prop.title} className="w-full h-40 object-cover" />
                                    <div className="p-4">
                                        <p className="font-bold text-inverland-dark truncate">{prop.title}</p>
                                        <p className="text-sm text-gray-500">{prop.location}</p>
                                        <p className="text-lg font-extrabold text-inverland-dark mt-2">{formatCurrency(prop.price)}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${getPipelineStageColor(prop.pipelineStage)}`}>{prop.pipelineStage || 'Sin etapa'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}) : <p className="text-gray-500 col-span-full text-center py-8">No tienes propiedades asignadas.</p>}
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="overflow-x-auto animate-fade-in">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agente Asignado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {agentClients.length > 0 ? agentClients.map(client => {
                                        // FIX: Add conditional styling for selected client.
                                        const isSelected = client.id === selectedClient?.id;
                                        return (
                                        <tr 
                                            key={client.id} 
                                            onClick={() => onViewClient(client)} 
                                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(client.status)}>{client.status}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentUser.name || currentUser.username}</td>
                                        </tr>
                                    )}) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tienes clientes asignados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AgentPortal;
