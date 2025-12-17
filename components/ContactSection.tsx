import React, { useState } from 'react';
import OfficeMap from './OfficeMap';

const ContactSection: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const officeLocation = {
        lat: 21.14519209685408,
        lng: -101.69164941912484,
        address: "Calle Nubes 219, Col. Jardines de Moral, 37160, León Gto. MX."
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, phone, message } = formData;
        
        const subject = `Contacto desde Inverland.mx - ${name}`;
        const body = `Un nuevo cliente potencial ha llenado el formulario de contacto:\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nMensaje:\n${message}`;
        
        const mailtoLink = `mailto:hola@inverland.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;

        // Reset form after submission attempt
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <section id="contact" className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-ileana-navy mb-4">¿Listo para dar el siguiente paso?</h2>
                        <p className="text-lg text-gray-600 mb-6">Nuestro equipo de expertos está aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo a la brevedad para asesorarte en tu próxima inversión.</p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ileana-orange mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-gray-700">+52 (477) 390 9043</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ileana-orange mr-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.097l-1.214 4.439 4.572-1.21zM9.06 8.903c-.19-.483.08-1.022.56-1.233.48-.213 1.024.077 1.236.562l.24 1.198c.18.9.12 1.948-.2 2.762-.31.81-.46 1.732.16 2.449.63 1.198 2.23 1.198 2.86.0.21-.4.28-.88.16-1.32l-.48-1.9c-.19-.483.08-1.022.56-1.233.48-.213 1.024.077 1.236.562l.72 2.87c.18.9.12 1.948-.2 2.762-.31.81-1.03 2.2-2.86 1.9-.95-.12-1.63-.5-2.28-1.04-1.84-1.32-3.24-4.44-3.52-5.84l-.24-.96z"/>
                                </svg>
                                <span className="text-gray-700">+52 (477) 667 0010 (WhatsApp)</span>
                            </div>
                             <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ileana-orange mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-gray-700">hola@inverland.mx</span>
                            </div>
                            <div className="flex items-start sm:items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ileana-orange mr-3 flex-shrink-0 mt-1 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-gray-700">{officeLocation.address}</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ileana-orange mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-gray-700">Lunes - Viernes de 9:00 a 18:00 hrs</span>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold text-ileana-navy mb-4">Nuestras Oficinas</h3>
                            <OfficeMap 
                                lat={officeLocation.lat} 
                                lng={officeLocation.lng} 
                                popupText="<b>Grupo Inverland</b><br/>Calle Nubes 219" 
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 md:p-8 rounded-lg shadow-xl">
                         <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ileana-orange focus:border-ileana-orange bg-white text-gray-800" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ileana-orange focus:border-ileana-orange bg-white text-gray-800" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ileana-orange focus:border-ileana-orange bg-white text-gray-800" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                                <textarea name="message" id="message" value={formData.message} onChange={handleInputChange} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ileana-orange focus:border-ileana-orange bg-white text-gray-800"></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-ileana-navy hover:bg-ileana-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ileana-navy transition-transform transform hover:scale-105">
                                    Enviar Mensaje
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;