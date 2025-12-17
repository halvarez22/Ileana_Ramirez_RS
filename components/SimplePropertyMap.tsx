import React from 'react';

interface SimplePropertyMapProps {
    lat: number | string;
    lng: number | string;
    popupText: string;
}

const SimplePropertyMap: React.FC<SimplePropertyMapProps> = ({ lat, lng, popupText }) => {
    // Convertir strings a números si es necesario
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
    
    // DEBUG: Mostrar coordenadas ANTES de validación
    console.log('🔍 SimplePropertyMap recibió:', { lat, lng, popupText });
    console.log('🔍 Convertido a números:', { latNum, lngNum });
    console.log('🔍 Tipos:', { latType: typeof lat, lngType: typeof lng });
    console.log('🔍 Validaciones:', { 
        isNaN_lat: isNaN(latNum), 
        isNaN_lng: isNaN(lngNum), 
        lat_zero: latNum === 0, 
        lng_zero: lngNum === 0,
        lat_range: latNum < -90 || latNum > 90,
        lng_range: lngNum < -180 || lngNum > 180
    });
    
    // Validate coordinates - más estricto para evitar mapas incorrectos
    if (isNaN(latNum) || isNaN(lngNum) || latNum === 0 || lngNum === 0 || 
        latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        return (
            <div style={{ height: '400px', width: '100%', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <p className="text-gray-600 mb-2">📍 Coordenadas no configuradas</p>
                <p className="text-sm text-gray-500">Esta propiedad necesita coordenadas válidas para mostrar el mapa</p>
                <p className="text-xs text-gray-400 mt-2">Lat: {lat}, Lng: {lng}</p>
            </div>
        );
    }

    // Create OpenStreetMap URL (no API key required)
    // PRUEBA: Usar formato estándar de OpenStreetMap
    // Para México: León (21.1098, -101.6878) debe mostrar León, Guanajuato
    
    // DEBUG: Mostrar coordenadas en consola
    console.log('Mapa coordenadas:', { latNum, lngNum, popupText });
    console.log('URL generada:', `bbox=${lngNum-0.01},${latNum-0.01},${lngNum+0.01},${latNum+0.01}&marker=${latNum},${lngNum}`);
    
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lngNum-0.01},${latNum-0.01},${lngNum+0.01},${latNum+0.01}&layer=mapnik&marker=${latNum},${lngNum}`;

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa de ${popupText}`}
            />
            <div style={{ 
                position: 'absolute', 
                bottom: '10px', 
                right: '10px', 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                padding: '8px', 
                borderRadius: '4px',
                fontSize: '12px',
                color: '#666',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                📍 {popupText}<br/>
                Lat: {latNum.toFixed(6)}<br/>
                Lng: {lngNum.toFixed(6)}
            </div>
            <div style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '10px',
                color: '#666',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                🗺️ OpenStreetMap
            </div>
        </div>
    );
};

export default SimplePropertyMap;
