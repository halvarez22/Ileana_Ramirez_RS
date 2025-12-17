// FIX: Added all type definitions here and removed constants.

export interface ActivityLog {
    id: string;
    timestamp: string;
    activity: string;
    details: string;
    agentId: string;
}

export interface ClientActivityLog {
    id: string;
    timestamp: string;
    activity: string;
    details: string;
}

export interface Client {
    id:string;
    name: string;
    email: string;
    phone?: string;
    status: 'Lead' | 'Contactado' | 'Activo' | 'En espera' | 'Descartado';
    leadSource?: 'Web' | 'Referido' | 'Llamada' | 'Otro';
    assignedAgentId?: string;
    notes?: string;
    activityLog?: ClientActivityLog[];
    createdAt?: string;
}

export interface Campaign {
    id: string;
    name: string;
    subject: string;
    body: string;
    targetAudience: {
        status: Client['status'][];
        leadSource: NonNullable<Client['leadSource']>[];
    };
    status: 'Borrador' | 'Enviada';
    sentAt?: string;
    sentToCount: number;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    type: string;
    operationType: 'Venta' | 'Renta' | 'Renta temporal';
    price: number;
    rentPrice?: number;
    showPrice: boolean;
    bedrooms: number;
    bathrooms: number;
    halfBathrooms?: number;
    parkingSpaces: number;
    constructionArea: number;
    landArea?: number;
    landDepth?: number;
    landFront?: number;
    constructionYear?: number;
    floorNumber?: number;
    buildingFloors?: number;
    maintenanceFee?: number;
    internalKey?: string;
    keyLockerCode?: string;
    country: string;
    state: string;
    city: string;
    neighborhood?: string;
    street: string;
    streetNumber?: string;
    interiorNumber?: string;
    crossStreet?: string;
    zipCode?: string;
    location: string;
    showExactLocation?: boolean;
    latitude: number;
    longitude: number;
    images: string[];
    videos?: string[]; // URLs de videos de YouTube
    video360?: string | string[]; // URL(s) del recorrido 360 (compatibilidad: string o array)
    mainPhotoIndex?: number;
    amenities: string[];
    status: 'For Sale' | 'Sold' | 'Rented';
    agentId?: string | null;
    clientId?: string | null;
    activityLog?: ActivityLog[];
    pipelineStage?: 'Lead' | 'Contactado' | 'Visita Agendada' | 'Negociación' | 'Cerrado';
    soldAt?: string;
    // Commission fields
    commissionAmount?: number;
}

export interface PropertyFilters {
    type: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    amenities: string[];
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
}

export interface User {
    id: string;
    username: string;
    password?: string;
    role: 'admin' | 'agent' | 'user' | 'referrer';
    name?: string;
    commissionRate?: number; // e.g., 0.025 for 2.5% of the total price
}