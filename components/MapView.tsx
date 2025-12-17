import React, { useEffect, useRef } from 'react';
import { Property } from '../types';

// Declare Leaflet's global 'L' object to satisfy TypeScript
declare const L: any;

interface MapViewProps {
    properties: Property[];
    onViewProperty: (property: Property) => void;
}

const MapView: React.FC<MapViewProps> = ({ properties, onViewProperty }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // To hold the map instance
    const markersRef = useRef<any[]>([]); // To hold marker instances

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Initialize map only once
            const map = L.map(mapContainerRef.current).setView([23.6345, -102.5528], 5); // Centered on Mexico
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            mapRef.current = map;
        }
    }, []); // Empty dependency array ensures this runs only once

    useEffect(() => {
        if (mapRef.current) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            if (properties.length === 0) return;

            // Add new markers for filtered properties
            const newMarkers = properties.map(property => {
                const marker = L.marker([property.latitude, property.longitude]).addTo(mapRef.current);
                
                const safeImg = (() => {
                    const s = property.images[0];
                    return s && (s.startsWith('http') || s.startsWith('data:')) ? s : 'https://picsum.photos/600/400?grayscale';
                })();

                const priceText = property.operationType.includes('Renta') && (property.rentPrice ?? 0) > 0
                    ? formatPrice(property.rentPrice as number)
                    : formatPrice(property.price);

                const operationType = property.operationType.includes('Renta') ? 'For Rent' : 'For Sale';
                const operationColor = property.operationType.includes('Renta') ? '#3B82F6' : '#10B981';

                const popupContent = `
                    <div style="width: 200px; font-family: 'Inter', sans-serif; line-height: 1.5;">
                        <div style="position: relative;">
                            <img src="${safeImg}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />
                            <div style="position: absolute; top: 8px; right: 8px; background-color: ${operationColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">${operationType}</div>
                        </div>
                        <h4 style="margin: 8px 0 4px; font-weight: 700; font-size: 14px; color: #0F172A;">${property.title}</h4>
                        <p style="margin: 0; font-size: 12px; color: #4B5563;">${property.location}</p>
                        <p style="margin: 4px 0 8px; font-weight: 800; font-size: 16px; color: #1E3A8A;">${priceText}</p>
                        <button id="view-details-${property.id}" style="width: 100%; padding: 8px; background-color: #083d5c; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#062a40'" onmouseout="this.style.backgroundColor='#083d5c'">Ver Detalles</button>
                    </div>
                `;

                marker.bindPopup(popupContent);
                
                marker.on('popupopen', () => {
                    // Setup button inside popup
                    const button = document.getElementById(`view-details-${property.id}`);
                    if (button) {
                        button.onclick = () => onViewProperty(property);
                    }
                    
                    // Zoom and pan to the selected marker
                    const map = mapRef.current;
                    if (map) {
                        const targetZoom = Math.max(map.getZoom(), 15); // Zoom in, but don't zoom out
                        map.flyTo([property.latitude, property.longitude], targetZoom, {
                            animate: true,
                            duration: 0.8
                        });
                    }
                });

                return marker;
            });

            markersRef.current = newMarkers;

            // Adjust map view to fit all markers
            if (newMarkers.length > 0) {
                const group = L.featureGroup(newMarkers);
                mapRef.current.fitBounds(group.getBounds().pad(0.1));
            }
        }
    }, [properties, onViewProperty]); // Re-run when properties change

    return <div ref={mapContainerRef} style={{ height: '600px', width: '100%', borderRadius: '8px' }} />;
};

export default MapView;