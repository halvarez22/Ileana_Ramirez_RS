import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Property, ActivityLog } from '../types';
import { SAMPLE_PROPERTIES } from '../constants';
import { propertyService, clientService, campaignService } from '../services/firebaseService';

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => void;
    updateProperty: (property: Property) => void;
    deleteProperty: (propertyId: string) => void;
    assignPropertiesToAgent: (agentId: string, propertyIds: string[]) => void;
    addActivityToProperty: (propertyId: string, activityData: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
    assignClientToProperty: (propertyId: string, clientId: string | null) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);

    const isValidImageSrc = (src?: string) => {
        if (!src) return false;
        // Solo permitir URLs absolutas o data URLs. NO permitir blob: para persistencia/producción
        return src.startsWith('http') || src.startsWith('data:');
    };

    const withSafeImages = (property: Property): Property => {
        const safeImages = (property.images || []).map(img => isValidImageSrc(img) ? img : 'https://picsum.photos/600/400?grayscale');
        const safeMainIndex = Number.isInteger(property.mainPhotoIndex) && property.mainPhotoIndex! >= 0 && property.mainPhotoIndex! < safeImages.length ? property.mainPhotoIndex : 0;
        return { ...property, images: safeImages, mainPhotoIndex: safeMainIndex };
    };

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const firebaseProperties = await propertyService.getAllProperties();
                if (firebaseProperties.length > 0) {
                    const safe = firebaseProperties.map(withSafeImages);
                    setProperties(safe);

                    // Migrar propiedades con imágenes inválidas (blob:/rutas locales) en Firebase
                    const toMigrate = firebaseProperties.filter(p => (p.images || []).some(img => img && img.startsWith('blob:')));
                    if (toMigrate.length > 0) {
                        for (const p of toMigrate) {
                            try {
                                const migratedImages = (p.images || []).map(img => isValidImageSrc(img) ? img : 'https://picsum.photos/600/400?grayscale');
                                const safeMainIndex = Number.isInteger(p.mainPhotoIndex) && (p.mainPhotoIndex as number) >= 0 && (p.mainPhotoIndex as number) < migratedImages.length ? p.mainPhotoIndex : 0;
                                await propertyService.updateProperty(p.id, { images: migratedImages, mainPhotoIndex: safeMainIndex });
                            } catch (e) {
                                console.warn('No se pudo migrar imágenes inválidas para propiedad', p.id, e);
                            }
                        }
                    }
                } else {
                    // Si no hay propiedades en Firebase
                    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    
                    if (isDevelopment) {
                        // En desarrollo: usar datos de muestra
                        setProperties(SAMPLE_PROPERTIES.map(withSafeImages));
                        // Migrar datos de muestra a Firebase
                        try {
                            const [firebaseClients, firebaseCampaigns] = await Promise.all([
                                clientService.getAllClients(),
                                campaignService.getAllCampaigns()
                            ]);
                            
                            if (firebaseClients.length === 0 && firebaseCampaigns.length === 0) {
                                console.log("Development environment - migrating sample data to Firebase");
                                for (const property of SAMPLE_PROPERTIES) {
                                    await propertyService.addProperty(property);
                                }
                                console.log("Sample properties migrated to Firebase");
                            }
                        } catch (migrationError) {
                            console.warn("Failed to migrate sample properties to Firebase:", migrationError);
                        }
                    } else {
                        // En producción: empezar con lista vacía
                        setProperties([]);
                        console.log("Production environment - starting with empty properties list");
                    }
                }
            } catch (error) {
                console.error("Failed to load properties from Firebase:", error);
                // Fallback a localStorage si Firebase falla
                try {
                    const storedProperties = localStorage.getItem('ileana_properties');
                    if (storedProperties) {
                        const parsed: Property[] = JSON.parse(storedProperties);
                        setProperties(parsed.map(withSafeImages));
                    } else {
                        setProperties(SAMPLE_PROPERTIES.map(withSafeImages));
                    }
                } catch (localError) {
                    console.error("Failed to access localStorage for properties:", localError);
                    setProperties(SAMPLE_PROPERTIES.map(withSafeImages));
                }
            }
        };

        loadProperties();
    }, []);

    const saveProperties = (newProperties: Property[]) => {
        try {
            localStorage.setItem('ileana_properties', JSON.stringify(newProperties));
        } catch (error) {
            console.error("Failed to save properties to localStorage:", error);
        }
        setProperties(newProperties);
    };

    const addProperty = async (property: Omit<Property, 'id'>) => {
        try {
            const newPropertyId = await propertyService.addProperty(property);
            const newProperty: Property = { ...property, id: newPropertyId };
            setProperties(prev => [withSafeImages(newProperty), ...prev]);
            
            // También guardar en localStorage como backup
            try {
                const updatedProperties = [withSafeImages(newProperty), ...properties.map(withSafeImages)];
                localStorage.setItem('ileana_properties', JSON.stringify(updatedProperties));
            } catch (localError) {
                console.warn("Failed to save to localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to add property to Firebase:", error);
            // Fallback a localStorage
            const newProperty: Property = { ...property, id: `prop-${Date.now()}` };
            const updatedProperties = [...properties, newProperty];
            setProperties(updatedProperties);
            localStorage.setItem('ileana_properties', JSON.stringify(updatedProperties));
        }
    };

    const updateProperty = async (updatedProperty: Property) => {
        try {
            await propertyService.updateProperty(updatedProperty.id, updatedProperty);
            setProperties(prev => prev.map(prop => 
                prop.id === updatedProperty.id ? updatedProperty : prop
            ));
            
            // También actualizar localStorage como backup
            try {
                const updatedProperties = properties.map(prop => 
                    prop.id === updatedProperty.id ? updatedProperty : prop
                );
                localStorage.setItem('ileana_properties', JSON.stringify(updatedProperties));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to update property in Firebase:", error);
            // Fallback a localStorage
            const updatedProperties = properties.map(prop => 
                prop.id === updatedProperty.id ? withSafeImages(updatedProperty) : withSafeImages(prop)
            );
            setProperties(updatedProperties);
            localStorage.setItem('ileana_properties', JSON.stringify(updatedProperties));
        }
    };

    const deleteProperty = async (propertyId: string) => {
        try {
            await propertyService.deleteProperty(propertyId);
            setProperties(prev => prev.filter(prop => prop.id !== propertyId));
            
            // También actualizar localStorage como backup
            try {
                const updatedProperties = properties.filter(prop => prop.id !== propertyId);
                localStorage.setItem('ileana_properties', JSON.stringify(updatedProperties));
            } catch (localError) {
                console.warn("Failed to update localStorage backup:", localError);
            }
        } catch (error) {
            console.error("Failed to delete property from Firebase:", error);
            // Fallback a localStorage
            const updatedProperties = properties.filter(prop => prop.id !== propertyId);
            setProperties(updatedProperties);
            localStorage.setItem('ileana_properties', JSON.stringify(updatedProperties));
        }
    };

    const assignPropertiesToAgent = (agentId: string, propertyIds: string[]) => {
        const updatedProperties = properties.map(prop => {
            // Assign property if it's in the list
            if (propertyIds.includes(prop.id)) {
                return { ...prop, agentId: agentId };
            }
            // Unassign property if it previously belonged to this agent but is no longer selected
            if (prop.agentId === agentId && !propertyIds.includes(prop.id)) {
                return { ...prop, agentId: null };
            }
            return prop;
        });
        saveProperties(updatedProperties);
    };

    const addActivityToProperty = (propertyId: string, activityData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
        const newActivity: ActivityLog = {
            ...activityData,
            id: `activity-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };

        const updatedProperties = properties.map(p => {
            if (p.id === propertyId) {
                const updatedLog = p.activityLog ? [...p.activityLog, newActivity] : [newActivity];
                return { ...p, activityLog: updatedLog };
            }
            return p;
        });
        saveProperties(updatedProperties);
    };

    const assignClientToProperty = (propertyId: string, clientId: string | null) => {
        const updatedProperties = properties.map(p => {
            if (p.id === propertyId) {
                return { ...p, clientId: clientId };
            }
            return p;
        });
        saveProperties(updatedProperties);
    };

    return (
        <PropertyContext.Provider value={{ properties, addProperty, updateProperty, deleteProperty, assignPropertiesToAgent, addActivityToProperty, assignClientToProperty }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperties = () => {
    const context = useContext(PropertyContext);
    if (context === undefined) {
        throw new Error('useProperties must be used within a PropertyProvider');
    }
    return context;
};