
import React, { useState } from 'react';
import { Property, ActivityLog } from '../types';
import { useProperties } from './PropertyContext';
import { useClients } from './ClientContext';
import { useAuth } from './AuthContext';
import { ACTIVITY_TYPES } from '../constants';
import ClientAssignmentModal from './ClientAssignmentModal';

interface AgentPropertyDetailPageProps {
    property: Property;
    onBack: () => void;
}

const AgentPropertyDetailPage: React.FC<AgentPropertyDetailPageProps> = ({ property: initialProperty, onBack }) => {
    const { properties, updateProperty, addActivityToProperty } = useProperties();
    const property = properties.find(p => p.id === initialProperty.id) || initialProperty;
    
    const { clients } = useClients();
    const { users, currentUser } = useAuth();

    const [isClientModalOpen, setClientModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState('');
    const [newActivityDetails, setNewActivityDetails] = useState('');

    const assignedClient = clients.find(c => c.id === property.clientId);

    const handlePipelineStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStage = e.target.value as Property['pipelineStage'];
        updateProperty({ ...property, pipelineStage: newStage });
    };

    const handleSubmitActivity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newActivity.trim() || !currentUser) return;
        
        addActivityToProperty(property.id, {
            activity: newActivity,
            details: newActivityDetails,
            agentId: currentUser.id,
        });
        setNewActivity('');
        setNewActivityDetails('');
    };

    const sortedActivityLog = property.activityLog ? [...property.activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

    const formatPrice = (price: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
    const getAgentName = (agentId: string) => users.find(u => u.id === agentId)?.name || 'N/A';
    
    const pipelineStages: Property['pipelineStage'][] = ['Lead', 'Contactado', 'Visita Agendada', 'Negociación', 'Cerrado'];

    return (
        <>
        <section className="py-16 md:py-24 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <button onClick={onBack} className="mb-8 text-inverland-blue font-semibold hover:underline">
                    &larr; Volver al Portal de Agente
                </button>
                
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-2">
                            <h1 className="text-3xl font-extrabold text-inverland-dark">{property.title}</h1>
                            <p className="text-md text-gray-500 mt-1">{property.location}</p>
                            {property.showPrice && <p className="text-4xl font-bold text-inverland-green mt-4">{formatPrice(property.price)}</p>}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md border">
                            <label htmlFor="pipelineStage" className="block text-sm font-medium text-gray-700">Etapa del Pipeline</label>
                            <select id="pipelineStage" value={property.pipelineStage || ''} onChange={handlePipelineStageChange} className="mt-1 block w-full input-style">
                                <option value="">-- Sin etapa --</option>
                                {pipelineStages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                            </select>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700">Cliente Asignado</p>
                                <button onClick={() => setClientModalOpen(true)} className="text-left w-full mt-1 text-inverland-blue hover:underline text-sm p-1 -ml-1">
                                    {assignedClient ? assignedClient.name : 'Asignar cliente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-inverland-dark mb-4 border-b pb-2">Detalles del Inmueble</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 text-sm">
                                <div><strong className="block text-gray-500 text-xs uppercase">Tipo</strong>{property.type}</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Recámaras</strong>{property.bedrooms}</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Baños</strong>{property.bathrooms} (+{property.halfBathrooms || 0} medios)</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Estacionamientos</strong>{property.parkingSpaces}</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Área const.</strong>{property.constructionArea} m²</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Área terreno</strong>{property.landArea || 'N/A'} m²</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Año const.</strong>{property.constructionYear || 'N/A'}</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Clave Interna</strong>{property.internalKey || 'N/A'}</div>
                                <div><strong className="block text-gray-500 text-xs uppercase">Código Llave</strong>{property.keyLockerCode || 'N/A'}</div>
                            </div>
                            <h4 className="text-lg font-bold text-inverland-dark mt-6 mb-3 border-b pb-2">Descripción</h4>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm">{property.description}</p>
                        </div>
                        
                         <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-inverland-dark mb-4">Registrar Actividad</h3>
                            <form onSubmit={handleSubmitActivity} className="space-y-4">
                               <select value={newActivity} onChange={(e) => setNewActivity(e.target.value)} className="w-full input-style" required>
                                    <option value="">-- Selecciona una actividad --</option>
                                    {ACTIVITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                <textarea value={newActivityDetails} onChange={(e) => setNewActivityDetails(e.target.value)} rows={3} className="w-full input-style" placeholder="Detalles de la actividad..."></textarea>
                                <div className="text-right">
                                    <button type="submit" className="bg-inverland-blue text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors">Guardar Actividad</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-inverland-dark mb-4">Historial de Actividad</h3>
                            <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
                               {sortedActivityLog.length > 0 ? sortedActivityLog.map(log => (
                                    <div key={log.id} className="p-3 border-l-4 border-inverland-green bg-gray-50 rounded-r-md">
                                        <p className="font-semibold text-gray-800 text-sm">{log.activity}</p>
                                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                                        <p className="text-xs text-gray-400 mt-2">{formatDate(log.timestamp)} por {getAgentName(log.agentId)}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-center py-4 text-sm">Sin actividades registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        {isClientModalOpen && (
            <ClientAssignmentModal
                isOpen={isClientModalOpen}
                onClose={() => setClientModalOpen(false)}
                property={property}
            />
        )}
        <style>{`.input-style { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }`}</style>
        </>
    );
};

export default AgentPropertyDetailPage;
