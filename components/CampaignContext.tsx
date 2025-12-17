import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Campaign, Client } from '../types';
import { SAMPLE_CAMPAIGNS } from '../constants';
import { campaignService, propertyService, clientService } from '../services/firebaseService';

interface CampaignContextType {
    campaigns: Campaign[];
    addCampaign: (campaign: Omit<Campaign, 'id' | 'status' | 'sentToCount' | 'sentAt'>) => void;
    updateCampaign: (campaign: Campaign) => void;
    deleteCampaign: (campaignId: string) => void;
    sendCampaign: (campaignId: string, allClients: Client[]) => Client[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const loadCampaigns = async () => {
            try {
                // Intentar cargar desde Firebase primero
                const firebaseCampaigns = await campaignService.getAllCampaigns();
                if (firebaseCampaigns.length > 0) {
                    setCampaigns(firebaseCampaigns);
                    // También guardar en localStorage como backup
                    try {
                        localStorage.setItem('ileana_campaigns', JSON.stringify(firebaseCampaigns));
                    } catch (localError) {
                        console.warn("Failed to save to localStorage backup:", localError);
                    }
                } else {
                    // Si no hay campañas en Firebase
                    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    
                    if (isDevelopment) {
                        // En desarrollo: usar datos de muestra
                        setCampaigns(SAMPLE_CAMPAIGNS);
                        // Migrar datos de muestra a Firebase
                        try {
                            const [firebaseProperties, firebaseClients] = await Promise.all([
                                propertyService.getAllProperties(),
                                clientService.getAllClients()
                            ]);
                            
                            if (firebaseProperties.length === 0 && firebaseClients.length === 0) {
                                console.log("Development environment - migrating sample campaigns to Firebase");
                                for (const campaign of SAMPLE_CAMPAIGNS) {
                                    await campaignService.addCampaign(campaign);
                                }
                                console.log("Sample campaigns migrated to Firebase");
                            }
                        } catch (migrationError) {
                            console.warn("Failed to migrate sample campaigns to Firebase:", migrationError);
                        }
                        // También guardar en localStorage
                        try {
                            localStorage.setItem('ileana_campaigns', JSON.stringify(SAMPLE_CAMPAIGNS));
                        } catch (localError) {
                            console.warn("Failed to save sample campaigns to localStorage:", localError);
                        }
                    } else {
                        // En producción: empezar con lista vacía
                        setCampaigns([]);
                        console.log("Production environment - starting with empty campaigns list");
                    }
                }
            } catch (error) {
                console.error("Failed to load campaigns from Firebase:", error);
                // Fallback a localStorage si Firebase falla
                try {
                    const storedCampaigns = localStorage.getItem('ileana_campaigns');
                    if (storedCampaigns) {
                        setCampaigns(JSON.parse(storedCampaigns));
                    } else {
                        setCampaigns(SAMPLE_CAMPAIGNS);
                        localStorage.setItem('ileana_campaigns', JSON.stringify(SAMPLE_CAMPAIGNS));
                    }
                } catch (localError) {
                    console.error("Failed to access localStorage for campaigns:", localError);
                    setCampaigns(SAMPLE_CAMPAIGNS);
                }
            }
        };

        loadCampaigns();
    }, []);

    const saveCampaigns = (newCampaigns: Campaign[]) => {
        try {
            localStorage.setItem('ileana_campaigns', JSON.stringify(newCampaigns));
        } catch (error) {
            console.error("Failed to save campaigns to localStorage:", error);
        }
        setCampaigns(newCampaigns);
    };

    const addCampaign = async (campaign: Omit<Campaign, 'id' | 'status' | 'sentToCount' | 'sentAt'>) => {
        try {
            // Guardar en Firebase primero
            const newCampaignData: Omit<Campaign, 'id'> = {
                ...campaign,
                status: 'Borrador',
                sentToCount: 0,
            };
            const newCampaignId = await campaignService.addCampaign(newCampaignData);
            const newCampaign: Campaign = { 
                ...newCampaignData,
                id: newCampaignId,
            };
            const updatedCampaigns = [newCampaign, ...campaigns];
            setCampaigns(updatedCampaigns);
            
            // También guardar en localStorage como backup
            try {
                localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
            } catch (localError) {
                console.warn("Failed to save to localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to add campaign to Firebase:", error);
            // Fallback a localStorage
            const newCampaign: Campaign = { 
                ...campaign, 
                id: `campaign-${Date.now()}`,
                status: 'Borrador',
                sentToCount: 0,
            };
            const updatedCampaigns = [newCampaign, ...campaigns];
            setCampaigns(updatedCampaigns);
            localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
        }
    };

    const updateCampaign = async (updatedCampaign: Campaign) => {
        try {
            // Actualizar en Firebase primero
            await campaignService.updateCampaign(updatedCampaign.id, updatedCampaign);
            const updatedCampaigns = campaigns.map(c => (c.id === updatedCampaign.id ? updatedCampaign : c));
            setCampaigns(updatedCampaigns);
            
            // También actualizar localStorage como backup
            try {
                localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to update campaign in Firebase:", error);
            // Fallback a localStorage
            const updatedCampaigns = campaigns.map(c => (c.id === updatedCampaign.id ? updatedCampaign : c));
            setCampaigns(updatedCampaigns);
            localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
        }
    };

    const deleteCampaign = async (campaignId: string) => {
        try {
            // Eliminar de Firebase primero
            await campaignService.deleteCampaign(campaignId);
            const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
            setCampaigns(updatedCampaigns);
            
            // También actualizar localStorage como backup
            try {
                localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to delete campaign from Firebase:", error);
            // Fallback a localStorage
            const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
            setCampaigns(updatedCampaigns);
            localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
        }
    };
    
    const sendCampaign = async (campaignId: string, allClients: Client[]): Promise<Client[]> => {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign || campaign.status === 'Enviada') {
            console.warn("Campaign not found or already sent.");
            return [];
        }

        const targetClients = allClients.filter(client => {
            const statusMatch = campaign.targetAudience.status.length === 0 || campaign.targetAudience.status.includes(client.status);
            const sourceMatch = campaign.targetAudience.leadSource.length === 0 || (client.leadSource && campaign.targetAudience.leadSource.includes(client.leadSource));
            return statusMatch && sourceMatch;
        });

        const updatedCampaign: Campaign = {
            ...campaign,
            status: 'Enviada',
            sentAt: new Date().toISOString(),
            sentToCount: targetClients.length,
        };
        
        // Actualizar la campaña en Firebase
        try {
            await campaignService.updateCampaign(campaignId, updatedCampaign);
            const updatedCampaigns = campaigns.map(c => (c.id === campaignId ? updatedCampaign : c));
            setCampaigns(updatedCampaigns);
            
            // También actualizar localStorage como backup
            try {
                localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to update campaign status in Firebase:", error);
            // Fallback a localStorage
            const updatedCampaigns = campaigns.map(c => (c.id === campaignId ? updatedCampaign : c));
            setCampaigns(updatedCampaigns);
            localStorage.setItem('ileana_campaigns', JSON.stringify(updatedCampaigns));
        }
        
        return targetClients;
    };

    return (
        <CampaignContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign, sendCampaign }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaigns = () => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaigns must be used within a CampaignProvider');
    }
    return context;
};