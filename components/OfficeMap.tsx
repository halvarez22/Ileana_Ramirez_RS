import React, { useEffect, useRef } from 'react';

// Declare Leaflet's global 'L' object to satisfy TypeScript
declare const L: any;

interface OfficeMapProps {
    lat: number;
    lng: number;
    popupText: string;
}

const OfficeMap: React.FC<OfficeMapProps> = ({ lat, lng, popupText }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // To hold the map instance

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Initialize map only once
            const map = L.map(mapContainerRef.current).setView([lat, lng], 16); // Centered on the office, slightly more zoomed
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(popupText).openPopup();

            mapRef.current = map;
        }
    }, [lat, lng, popupText]); // Re-run if props change

    return <div ref={mapContainerRef} style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }} />;
};

export default OfficeMap;