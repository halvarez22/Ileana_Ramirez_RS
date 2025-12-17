import React, { useState } from 'react';
import { useCampaigns } from './CampaignContext';
import { useClients } from './ClientContext';
import { Campaign } from '../types';
import CampaignFormModal from './CampaignFormModal';

const MarketingPage: React.FC = () => {
    const { campaigns, deleteCampaign, sendCampaign } = useCampaigns();
    const { clients, addActivityToClient } = useClients();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const handleOpenModal = (campaign: Campaign | null = null) => {
        setEditingCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCampaign(null);
    };

    const handleDeleteCampaign = (campaignId: string, campaignName: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la campaña "${campaignName}"?`)) {
            deleteCampaign(campaignId);
        }
    };

    const handleSendCampaign = (campaignId: string) => {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        if (window.confirm(`¿Estás seguro de que deseas enviar la campaña "${campaign.name}"? Esta acción no se puede deshacer.`)) {
            const targetClients = sendCampaign(campaignId, clients);
            
            targetClients.forEach(client => {
                addActivityToClient(client.id, {
                    activity: 'Email de campaña recibido',
                    details: `Campaña: '${campaign.name}'`
                });
            });

            alert(`Campaña enviada a ${targetClients.length} clientes.`);
        }
    };

    const getStatusBadge = (status: Campaign['status']) => {
        const base = "px-2 py-1 text-xs font-semibold rounded-full";
        if (status === 'Enviada') {
            return `${base} bg-green-100 text-green-800`;
        }
        return `${base} bg-yellow-100 text-yellow-800`;
    };

    return (
        <>
            <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark mb-4 md:mb-0">
                            Marketing y Campañas
                        </h2>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="w-full md:w-auto bg-inverland-green text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-transform duration-300 transform hover:scale-105 shadow-md"
                        >
                            Crear Campaña
                        </button>
                    </div>

                    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Campaña</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatarios</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {campaigns.length > 0 ? campaigns.map(campaign => (
                                        <tr key={campaign.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{campaign.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(campaign.status)}>{campaign.status}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.sentToCount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                <button onClick={() => handleSendCampaign(campaign.id)} disabled={campaign.status === 'Enviada'} className="text-inverland-blue hover:text-inverland-dark disabled:text-gray-400 disabled:cursor-not-allowed">Enviar</button>
                                                <button onClick={() => handleOpenModal(campaign)} className="text-inverland-blue hover:text-inverland-dark">Editar</button>
                                                <button onClick={() => handleDeleteCampaign(campaign.id, campaign.name)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                            </td>
                                        </tr>
                                    )) : null}
                                </tbody>
                            </table>
                            {campaigns.length === 0 && (
                                <div className="text-center py-10">
                                    <h3 className="text-lg font-semibold text-gray-700">No hay campañas creadas</h3>
                                    <p className="text-gray-500 mt-1">Haz clic en "Crear Campaña" para empezar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            <CampaignFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                campaignToEdit={editingCampaign}
            />
        </>
    );
};

export default MarketingPage;
