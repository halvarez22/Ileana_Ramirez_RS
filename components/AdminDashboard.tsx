import React, { useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertyContext';

type View = 'agents' | 'tracking';

interface AdminDashboardProps {
    onNavigate: (view: View) => void;
}

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-ileana-lg flex items-center space-x-4 border border-ileana-orange/20">
        <div className="bg-ileana-orange/10 text-ileana-orange p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-ileana-navy">{value}</p>
        </div>
    </div>
);

const HomeModernIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v-2m0 2v.01M12 12a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0c0 1.105-1.343 2-3 2m3-2c0-1.105-1.343-2-3-2m0 0c-1.657 0-3 .895-3 2m0 0c0 1.105 1.343 2 3 2m0 0c1.657 0 3-.895 3-2m0 0c0-1.105-1.343-2-3-2" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;


const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-ileana-lg h-full border border-ileana-navy/10">
            <h3 className="text-lg font-bold text-ileana-navy mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map(item => (
                    <div key={item.label}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600 font-medium">{item.label}</span>
                            <span className="font-bold text-ileana-navy">{item.value}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2.5">
                            <div className="bg-ileana-orange h-2.5 rounded-full" style={{ width: `${(item.value / maxValue) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const { users } = useAuth();
    const { properties } = useProperties();

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value);

    const dashboardData = useMemo(() => {
        const forSale = properties.filter(p => p.status === 'For Sale');
        const sold = properties.filter(p => p.status === 'Sold');
        const totalValue = forSale.reduce((sum, p) => sum + p.price, 0);

        const statusDistribution = [
            { label: 'En Venta', value: forSale.length },
            { label: 'Vendidas', value: sold.length },
            { label: 'Rentadas', value: properties.filter(p => p.status === 'Rented').length },
        ];
        
        const typeDistribution = properties.reduce((acc, p) => {
            acc[p.type] = (acc[p.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const agentPerformance = users.filter(u => u.role === 'user' || u.role === 'agent').map(agent => {
            const assigned = properties.filter(p => p.agentId === agent.id).length;
            const sold = properties.filter(p => p.agentId === agent.id && p.status === 'Sold').length;
            return { id: agent.id, name: agent.name || agent.username, assigned, sold };
        });

        return {
            totalProperties: properties.length,
            forSaleCount: forSale.length,
            soldCount: sold.length,
            totalValue,
            statusDistribution,
// FIX: Changed Object.entries to Object.keys to ensure correct type inference for chart data.
            typeDistribution: Object.keys(typeDistribution).map((label) => ({ label, value: typeDistribution[label] })),
            agentPerformance,
        };
    }, [properties, users]);


    return (
        <section className="py-16 md:py-24 bg-ileana-light-gray">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ileana-navy mb-8 md:mb-12 text-center">Dashboard Gerencial</h2>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
                    <KpiCard title="Total de Inmuebles" value={dashboardData.totalProperties.toString()} icon={<HomeModernIcon />} />
                    <KpiCard title="Inmuebles en Venta" value={dashboardData.forSaleCount.toString()} icon={<ChartBarIcon />} />
                    <KpiCard title="Inmuebles Vendidos" value={dashboardData.soldCount.toString()} icon={<CheckBadgeIcon />} />
                    <KpiCard title="Valor del Portafolio" value={formatCurrency(dashboardData.totalValue)} icon={<BanknotesIcon />} />
                </div>

                {/* Charts and Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Agent Performance */}
                    <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-lg">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-ileana-navy">Rendimiento de Agentes</h3>
                             <button onClick={() => onNavigate('agents')} className="text-sm font-semibold text-ileana-orange hover:text-ileana-navy">Ver gestión de agentes &rarr;</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Agente</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asignadas</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendidas</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.agentPerformance.map(agent => (
                                        <tr key={agent.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{agent.assigned}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{agent.sold}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     {/* Property Type Chart */}
                     <div className="lg:col-span-1">
                        <BarChart data={dashboardData.typeDistribution} title="Propiedades por Tipo" />
                    </div>
                </div>

                <div className="mt-8">
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-ileana-navy">Estatus General de Propiedades</h3>
                            <button onClick={() => onNavigate('tracking')} className="text-sm font-semibold text-ileana-orange hover:text-ileana-navy">Ver seguimiento de inmuebles &rarr;</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {dashboardData.statusDistribution.map(item => (
                                <div key={item.label} className="bg-ileana-navy/5 p-4 rounded-md text-center border border-ileana-orange/20">
                                    <p className="text-3xl font-bold text-ileana-navy">{item.value}</p>
                                    <p className="text-sm font-medium text-ileana-orange">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AdminDashboard;