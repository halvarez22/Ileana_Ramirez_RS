import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Client, ClientActivityLog } from '../types';
import { SAMPLE_CLIENTS } from '../constants';
import { clientService, propertyService, campaignService } from '../services/firebaseService';

interface ClientContextType {
    clients: Client[];
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
    updateClient: (client: Client) => void;
    deleteClient: (clientId: string) => void;
    addActivityToClient: (clientId: string, activityData: Omit<ClientActivityLog, 'id' | 'timestamp'>) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const loadClients = async () => {
            try {
                // Intentar cargar desde Firebase primero
                const firebaseClients = await clientService.getAllClients();
                if (firebaseClients.length > 0) {
                    setClients(firebaseClients);
                    // También guardar en localStorage como backup
                    try {
                        localStorage.setItem('ileana_clients', JSON.stringify(firebaseClients));
                    } catch (localError) {
                        console.warn("Failed to save to localStorage backup:", localError);
                    }
                } else {
                    // Si no hay clientes en Firebase
                    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    
                    if (isDevelopment) {
                        // En desarrollo: usar datos de muestra
                        setClients(SAMPLE_CLIENTS);
                        // Migrar datos de muestra a Firebase
                        try {
                            const [firebaseProperties, firebaseCampaigns] = await Promise.all([
                                propertyService.getAllProperties(),
                                campaignService.getAllCampaigns()
                            ]);
                            
                            if (firebaseProperties.length === 0 && firebaseCampaigns.length === 0) {
                                console.log("Development environment - migrating sample clients to Firebase");
                                for (const client of SAMPLE_CLIENTS) {
                                    await clientService.addClient(client);
                                }
                                console.log("Sample clients migrated to Firebase");
                            }
                        } catch (migrationError) {
                            console.warn("Failed to migrate sample clients to Firebase:", migrationError);
                        }
                        // También guardar en localStorage
                        try {
                            localStorage.setItem('ileana_clients', JSON.stringify(SAMPLE_CLIENTS));
                        } catch (localError) {
                            console.warn("Failed to save sample clients to localStorage:", localError);
                        }
                    } else {
                        // En producción: empezar con lista vacía
                        setClients([]);
                        console.log("Production environment - starting with empty clients list");
                    }
                }
            } catch (error) {
                console.error("Failed to load clients from Firebase:", error);
                // Fallback a localStorage si Firebase falla
                try {
                    const storedClients = localStorage.getItem('ileana_clients');
                    if (storedClients) {
                        setClients(JSON.parse(storedClients));
                    } else {
                        setClients(SAMPLE_CLIENTS);
                        localStorage.setItem('ileana_clients', JSON.stringify(SAMPLE_CLIENTS));
                    }
                } catch (localError) {
                    console.error("Failed to access localStorage for clients:", localError);
                    setClients(SAMPLE_CLIENTS);
                }
            }
        };

        loadClients();
    }, []);

    const saveClients = (newClients: Client[]) => {
        try {
            localStorage.setItem('ileana_clients', JSON.stringify(newClients));
        } catch (error) {
            console.error("Failed to save clients to localStorage:", error);
        }
        setClients(newClients);
    };

    const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
        try {
            // Guardar en Firebase primero
            const newClientId = await clientService.addClient(client);
            const newClient: Client = { 
                ...client, 
                id: newClientId,
                createdAt: new Date().toISOString(),
            };
            const updatedClients = [newClient, ...clients];
            setClients(updatedClients);
            
            // También guardar en localStorage como backup
            try {
                localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
            } catch (localError) {
                console.warn("Failed to save to localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to add client to Firebase:", error);
            // Fallback a localStorage
            const newClient: Client = { 
                ...client, 
                id: `client-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            const updatedClients = [newClient, ...clients];
            setClients(updatedClients);
            localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
        }
    };

    const updateClient = async (updatedClient: Client) => {
        try {
            // Actualizar en Firebase primero
            await clientService.updateClient(updatedClient.id, updatedClient);
            const updatedClients = clients.map(c => (c.id === updatedClient.id ? updatedClient : c));
            setClients(updatedClients);
            
            // También actualizar localStorage como backup
            try {
                localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to update client in Firebase:", error);
            // Fallback a localStorage
            const updatedClients = clients.map(c => (c.id === updatedClient.id ? updatedClient : c));
            setClients(updatedClients);
            localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
        }
    };

    const deleteClient = async (clientId: string) => {
        try {
            // Eliminar de Firebase primero
            await clientService.deleteClient(clientId);
            const updatedClients = clients.filter(c => c.id !== clientId);
            setClients(updatedClients);
            
            // También actualizar localStorage como backup
            try {
                localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to delete client from Firebase:", error);
            // Fallback a localStorage
            const updatedClients = clients.filter(c => c.id !== clientId);
            setClients(updatedClients);
            localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
        }
    };
    
    const addActivityToClient = async (clientId: string, activityData: Omit<ClientActivityLog, 'id' | 'timestamp'>) => {
        const newActivity: ClientActivityLog = {
            ...activityData,
            id: `client-activity-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };

        const updatedClients = clients.map(c => {
            if (c.id === clientId) {
                const updatedLog = c.activityLog ? [...c.activityLog, newActivity] : [newActivity];
                return { ...c, activityLog: updatedLog };
            }
            return c;
        });

        // Actualizar el cliente en Firebase
        const clientToUpdate = updatedClients.find(c => c.id === clientId);
        if (clientToUpdate) {
            try {
                await clientService.updateClient(clientId, clientToUpdate);
                setClients(updatedClients);
                
                // También actualizar localStorage como backup
                try {
                    localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
                } catch (localError) {
                    console.warn("Failed to update localStorage backup:", localError);
                }
            } catch (error) {
                console.error("Failed to update client activity in Firebase:", error);
                // Fallback a localStorage
                setClients(updatedClients);
                localStorage.setItem('ileana_clients', JSON.stringify(updatedClients));
            }
        }
    };

    return (
        <ClientContext.Provider value={{ clients, addClient, updateClient, deleteClient, addActivityToClient }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClients = () => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
};