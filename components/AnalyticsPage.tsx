import React, { useMemo, useState } from 'react';
import { useProperties } from './PropertyContext';
import { useClients } from './ClientContext';
import { useAuth } from './AuthContext';
import ClientStatusDoughnutChart from './charts/ClientStatusDoughnutChart';
import LeadSourceBarChart from './charts/LeadSourceBarChart';

// Icons for KPIs
const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v-2m0 2v.01M12 12a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0c0 1.105-1.343 2-3 2m3-2c0-1.105-1.343-2-3-2m0 0c-1.657 0-3 .895-3 2m0 0c0 1.105 1.343 2 3 2m0 0c1.657 0 3-.895 3-2m0 0c0-1.105-1.343-2-3-2" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 00-6.44 0A6 6 0 003 20v1h12z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;


const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-6">
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-inverland-dark mt-1">{value}</p>
        </div>
    </div>
);

const AnalyticsPage: React.FC = () => {
    const { properties } = useProperties();
    const { clients } = useClients();
    const { users } = useAuth();
    
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setDateRange({ start: '', end: '' });
    };

    const analyticsData = useMemo(() => {
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        // Adjust end date to include the whole day
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        const filteredClients = clients.filter(client => {
            if (!startDate && !endDate) return true;
            const clientDate = new Date(client.createdAt);
            if (startDate && clientDate < startDate) return false;
            if (endDate && clientDate > endDate) return false;
            return true;
        });

        const soldProperties = properties.filter(p => p.status === 'Sold' && p.soldAt);
        
        const filteredSoldProperties = soldProperties.filter(p => {
            if (!startDate && !endDate) return true;
            const soldDate = new Date(p.soldAt!);
            if (startDate && soldDate < startDate) return false;
            if (endDate && soldDate > endDate) return false;
            return true;
        });
        
        const totalRevenue = filteredSoldProperties.reduce((sum, p) => sum + p.price, 0);
        const totalClients = filteredClients.length;
        const activeLeads = filteredClients.filter(c => c.status === 'Lead' || c.status === 'Contactado').length;
        
        const agentPerformance = users
            .filter(u => u.role === 'agent')
            .map(agent => {
                const agentSoldProperties = filteredSoldProperties.filter(p => p.agentId === agent.id);
                const totalSalesValue = agentSoldProperties.reduce((sum, p) => sum + p.price, 0);
                return {
                    id: agent.id,
                    name: agent.name || agent.username,
                    salesCount: agentSoldProperties.length,
                    totalSalesValue,
                };
            })
            .sort((a, b) => b.totalSalesValue - a.totalSalesValue);

        return {
            totalRevenue,
            totalClients,
            propertiesSoldCount: filteredSoldProperties.length,
            activeLeads,
            agentPerformance,
            filteredClients, // Pass filtered clients to charts
        };
    }, [properties, clients, users, dateRange]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    return (
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark">Dashboard de Analítica</h2>
                    <p className="text-lg text-gray-600 mt-2">Visualiza el rendimiento de tu negocio con datos en tiempo real.</p>
                </div>
                
                {/* Date Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-12 max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                         <div className="md:col-span-1">
                            <label htmlFor="start" className="block text-sm font-medium text-gray-700">Desde</label>
                            <input type="date" name="start" id="start" value={dateRange.start} onChange={handleDateChange} className="mt-1 block w-full input-style"/>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="end" className="block text-sm font-medium text-gray-700">Hasta</label>
                            <input type="date" name="end" id="end" value={dateRange.end} onChange={handleDateChange} className="mt-1 block w-full input-style"/>
                        </div>
                        <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                             <button onClick={() => {}} className="w-full bg-inverland-green text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors">
                                Aplicar
                            </button>
                            <button onClick={clearFilters} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
                    <KpiCard title="Ingresos Totales" value={formatCurrency(analyticsData.totalRevenue)} icon={<BanknotesIcon />} color="bg-green-100 text-green-600" />
                    <KpiCard title="Nuevos Clientes" value={analyticsData.totalClients.toString()} icon={<UsersIcon />} color="bg-blue-100 text-blue-600" />
                    <KpiCard title="Propiedades Vendidas" value={analyticsData.propertiesSoldCount.toString()} icon={<CheckBadgeIcon />} color="bg-indigo-100 text-indigo-600" />
                    <KpiCard title="Leads Activos" value={analyticsData.activeLeads.toString()} icon={<LightBulbIcon />} color="bg-yellow-100 text-yellow-600" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 mb-12">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg h-full flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-inverland-dark mb-4 text-center">Distribución de Clientes</h3>
                        <ClientStatusDoughnutChart clients={analyticsData.filteredClients} />
                    </div>
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-inverland-dark mb-4">Origen de Clientes (Lead Source)</h3>
                        <LeadSourceBarChart clients={analyticsData.filteredClients} />
                    </div>
                </div>
                
                {/* Agent Leaderboard */}
                 <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
                    <h3 className="text-2xl font-bold text-inverland-dark mb-6">Ranking de Agentes por Ventas</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedades Vendidas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total de Ventas</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analyticsData.agentPerformance.map((agent, index) => (
                                    <tr key={agent.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.salesCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{formatCurrency(agent.totalSalesValue)}</td>
                                    </tr>
                                ))}
                                 {analyticsData.agentPerformance.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">No hay datos de ventas para el período seleccionado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <style>{`.input-style { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }`}</style>
            </div>
        </section>
    );
};

export default AnalyticsPage;