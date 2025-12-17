
import React from 'react';

interface WhatsAppButtonProps {
    phoneNumber: string;
}

const WhatsAppIcon = () => (
    <svg fill="white" className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.097l-1.214 4.439 4.572-1.21zM9.06 8.903c-.19-.483.08-1.022.56-1.233.48-.213 1.024.077 1.236.562l.24 1.198c.18.9.12 1.948-.2 2.762-.31.81-.46 1.732.16 2.449.63 1.198 2.23 1.198 2.86.0.21-.4.28-.88.16-1.32l-.48-1.9c-.19-.483.08-1.022.56-1.233.48-.213 1.024.077 1.236.562l.72 2.87c.18.9.12 1.948-.2 2.762-.31.81-1.03 2.2-2.86 1.9-.95-.12-1.63-.5-2.28-1.04-1.84-1.32-3.24-4.44-3.52-5.84l-.24-.96z"/></svg>
);


const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber }) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent("Hola, me gustaría obtener más información.")}`;

    return (
        <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 z-40"
            aria-label="Contactar por WhatsApp"
        >
            <WhatsAppIcon />
        </a>
    );
};

export default WhatsAppButton;
