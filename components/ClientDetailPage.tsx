import React, { useState } from 'react';
import { Client, ClientActivityLog } from '../types';
import { useClients } from './ClientContext';
import { ACTIVITY_TYPES } from '../constants';

interface ClientDetailPageProps {
    client: Client;
    onBack: () => void;
}

const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ client, onBack }) => {
    const { addActivityToClient } = useClients();
    const [newActivity, setNewActivity] = useState('');
    const [newActivityDetails, setNewActivityDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitActivity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newActivity.trim()) {
            alert('Por favor, selecciona un tipo de actividad.');
            return;
        }
        setIsSubmitting(true);
        addActivityToClient(client.id, {
            activity: newActivity,
            details: newActivityDetails,
        });
        setNewActivity('');
        setNewActivityDetails('');
        setIsSubmitting(false);
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-MX', {
            dateStyle: 'long',
            timeStyle: 'short',
        });
    };

    const sortedActivityLog = client.activityLog ? [...client.activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

    const getStatusBadge = (status: Client['status']) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-block";
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
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <button onClick={onBack} className="mb-8 text-inverland-blue font-semibold hover:underline">
                    &larr; Volver al Portal
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Client Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-lg sticky top-28">
                            <h2 className="text-2xl font-bold text-inverland-dark">{client.name}</h2>
                            <p className="text-gray-600 mt-1">{client.email}</p>
                            <p className="text-gray-600">{client.phone}</p>
                            <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                                <p><strong className="text-gray-800">Estatus:</strong> <span className={getStatusBadge(client.status)}>{client.status}</span></p>
                                <p><strong className="text-gray-800">Fuente:</strong> <span className="text-gray-600">{client.leadSource || 'N/A'}</span></p>
                                <p><strong className="text-gray-800">Notas:</strong></p>
                                <p className="text-gray-600 italic bg-gray-50 p-2 rounded-md">{client.notes || 'Sin notas.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log and Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                            <h3 className="text-xl font-bold text-inverland-dark mb-4">Registrar Actividad</h3>
                            <form onSubmit={handleSubmitActivity} className="space-y-4">
                                <div>
                                    <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Tipo de Actividad</label>
                                    <select 
                                        id="activity" 
                                        value={newActivity}
                                        onChange={(e) => setNewActivity(e.target.value)}
                                        className="mt-1 block w-full input-style"
                                        required
                                    >
                                        <option value="">-- Selecciona una actividad --</option>
                                        {ACTIVITY_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="details" className="block text-sm font-medium text-gray-700">Detalles</label>
                                    <textarea 
                                        id="details" 
                                        rows={3}
                                        value={newActivityDetails}
                                        onChange={(e) => setNewActivityDetails(e.target.value)}
                                        className="mt-1 block w-full input-style"
                                        placeholder="Añade notas sobre la actividad..."
                                    ></textarea>
                                </div>
                                <div className="text-right">
                                    <button type="submit" disabled={isSubmitting} className="bg-inverland-blue text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-inverland-dark mb-4">Historial de Actividades</h3>
                            <div className="space-y-4">
                                {sortedActivityLog.length > 0 ? sortedActivityLog.map(log => (
                                    <div key={log.id} className="p-4 border-l-4 border-inverland-green bg-gray-50 rounded-r-lg">
                                        <p className="font-semibold text-gray-800">{log.activity}</p>
                                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                                        <p className="text-xs text-gray-400 mt-2">{formatDate(log.timestamp)}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-center py-4">No hay actividades registradas para este cliente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                 <style>{`.input-style { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }`}</style>
            </div>
        </section>
    );
};

export default ClientDetailPage;