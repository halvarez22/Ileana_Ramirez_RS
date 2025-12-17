import React, { useMemo, useState } from 'react';
import { useProperties } from './PropertyContext';
import { useAuth } from './AuthContext';
import { useClients } from './ClientContext';
import { Property } from '../types';
import ClientAssignmentModal from './ClientAssignmentModal';
import SalesPipeline from './SalesPipeline'; // Import the new component

// KPI Card component
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

// Icons for KPIs
const HomeModernIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v-2m0 2v.01M12 12a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0c0 1.105-1.343 2-3 2m3-2c0-1.105-1.343-2-3-2m0 0c-1.657 0-3 .895-3 2m0 0c0 1.105 1.343 2 3 2m0 0c1.657 0 3-.895 3-2m0 0c0-1.105-1.343-2-3-2" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 00-6.44 0A6 6 0 003 20v1h12z" /></svg>;


const TrackingPage: React.FC = () => {
    const { properties, updateProperty } = useProperties();
    const { users } = useAuth();
    const { clients } = useClients();
    const [view, setView] = useState<'metrics' | 'pipeline'>('pipeline');

    const [isClientModalOpen, setClientModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const handleOpenClientModal = (property: Property) => {
        setSelectedProperty(property);
        setClientModalOpen(true);
    };

    const handleCloseClientModal = () => {
        setSelectedProperty(null);
        setClientModalOpen(false);
    };
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value);
    
    const kpiData = useMemo(() => {
        const soldProperties = properties.filter(p => p.status === 'Sold');
        const soldCount = soldProperties.length;
        const totalRevenue = soldProperties.reduce((sum, p) => sum + p.price, 0);
        const activeAgents = users.filter(u => u.role === 'user' || u.role === 'agent').length;

        return {
            soldCount,
            totalRevenue,
            activeAgents
        };
    }, [properties, users]);

    const agentPerformance = useMemo(() => {
        const agents = users.filter(u => u.role === 'user' || u.role === 'agent');
        const performanceData = agents.map(agent => {
            const agentSoldProperties = properties.filter(p => p.agentId === agent.id && p.status === 'Sold');
            const soldCount = agentSoldProperties.length;
            const totalSalesValue = agentSoldProperties.reduce((sum, p) => sum + p.price, 0);
            return { id: agent.id, name: agent.name || agent.username, soldCount, totalSalesValue };
        });
        return performanceData.sort((a, b) => b.totalSalesValue - a.totalSalesValue);
    }, [properties, users]);

    return (
        <>
            <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark">Seguimiento y Rendimiento</h2>
                        <p className="text-lg text-gray-600 mt-2">Analiza las métricas clave o visualiza el embudo de ventas.</p>
                        <div className="mt-4 inline-flex items-center space-x-2 bg-gray-200 p-1 rounded-lg">
                            <button onClick={() => setView('pipeline')} className={`px-4 py-2 text-sm rounded-md transition-colors ${view === 'pipeline' ? 'bg-white text-inverland-dark shadow' : 'text-gray-600'}`}>Pipeline de Ventas</button>
                            <button onClick={() => setView('metrics')} className={`px-4 py-2 text-sm rounded-md transition-colors ${view === 'metrics' ? 'bg-white text-inverland-dark shadow' : 'text-gray-600'}`}>Métricas</button>
                        </div>
                    </div>

                    {view === 'metrics' && (
                        <div className="space-y-8 md:space-y-12 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-bold text-inverland-dark mb-6 text-center">Métricas Clave</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    <KpiCard title="Propiedades Vendidas" value={kpiData.soldCount.toString()} icon={<HomeModernIcon />} />
                                    <KpiCard title="Ingresos Totales" value={formatCurrency(kpiData.totalRevenue)} icon={<BanknotesIcon />} />
                                    <KpiCard title="Agentes Activos" value={kpiData.activeAgents.toString()} icon={<UsersIcon />} />
                                </div>
                            </div>

                            <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl">
                                <h3 className="text-2xl font-bold text-inverland-dark mb-6">Rendimiento de Agentes (Ventas Cerradas)</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agente</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedades Vendidas</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total de Ventas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {agentPerformance.map(agent => (
                                                <tr key={agent.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.soldCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(agent.totalSalesValue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'pipeline' && (
                        <div className="animate-fade-in">
                            <SalesPipeline 
                                properties={properties} 
                                users={users}
                                clients={clients}
                                onAssignClient={handleOpenClientModal}
                                updateProperty={updateProperty}
                            />
                        </div>
                    )}
                    
                </div>
            </section>
            {isClientModalOpen && selectedProperty && (
                <ClientAssignmentModal
                    isOpen={isClientModalOpen}
                    onClose={handleCloseClientModal}
                    property={selectedProperty}
                />
            )}
        </>
    );
};

export default TrackingPage;
