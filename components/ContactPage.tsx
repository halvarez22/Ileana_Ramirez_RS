import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_slqwydd';
const EMAILJS_TEMPLATE_ID = 'template_q5xy7s8';
const EMAILJS_PUBLIC_KEY = 'Hwo6fv58nKvtLnHs2';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');
        
        try {
            // Configurar EmailJS
            emailjs.init(EMAILJS_PUBLIC_KEY);
            
            // Preparar datos para el template
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                to_email: 'hola@inverland.mx'
            };
            
            // Enviar email
            const result = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );
            
            console.log('Email enviado exitosamente:', result);
            
            // Éxito
            setSubmitStatus('success');
            setSubmitMessage('¡Gracias por contactarnos! Te responderemos pronto.');
            
            // Limpiar formulario
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            
        } catch (error) {
            console.error('Error enviando email:', error);
            
            // Error
            setSubmitStatus('error');
            setSubmitMessage('Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o contáctanos directamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-ileana-navy to-ileana-navy/90 text-ileana-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
                            Contacto
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-orange-100 leading-relaxed px-2">
                            Estamos aquí para ayudarte a encontrar la propiedad perfecta. ¡Contáctanos hoy mismo!
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Information & Form */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-ileana-navy mb-6">
                                    Información de Contacto
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Nuestro equipo está listo para brindarte el mejor servicio inmobiliario. 
                                    Contáctanos por cualquiera de estos medios.
                                </p>
                            </div>

                            {/* Contact Cards */}
                            <div className="space-y-6">
                                {/* Address */}
                                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-ileana-orange rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-ileana-navy mb-2">Dirección</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                Nubes 219, Jardines del Moral<br />
                                                37160 León de los Aldama, Gto.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-ileana-navy rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-ileana-navy mb-2">Teléfono</h3>
                                            <a href="tel:+524777871635" className="text-gray-700 hover:text-ileana-orange transition-colors duration-300">
                                                52.477.667.0010
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-ileana-navy mb-2">Email</h3>
                                            <a href="mailto:hola@inverland.mx" className="text-gray-700 hover:text-ileana-orange transition-colors duration-300">
                                                hola@inverland.mx
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-ileana-navy mb-2">WhatsApp</h3>
                                            <a href="https://wa.me/524777871635" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-500 transition-colors duration-300">
                                                +52 477 667 0010
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-ileana-navy mb-4 sm:mb-6">
                                Envíanos un Mensaje
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre Completo *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ileana-orange focus:border-transparent outline-none transition-colors duration-300"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ileana-orange focus:border-transparent outline-none transition-colors duration-300"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ileana-orange focus:border-transparent outline-none transition-colors duration-300"
                                            placeholder="Tu número de teléfono"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Asunto *
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ileana-orange focus:border-transparent outline-none transition-colors duration-300"
                                        >
                                            <option value="">Selecciona un asunto</option>
                                            <option value="compra">Compra de Propiedad</option>
                                            <option value="venta">Venta de Propiedad</option>
                                            <option value="renta">Renta de Propiedad</option>
                                            <option value="inversion">Inversión Inmobiliaria</option>
                                            <option value="consulta">Consulta General</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Mensaje *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ileana-orange focus:border-transparent outline-none transition-colors duration-300 resize-none"
                                        placeholder="Cuéntanos cómo podemos ayudarte..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-inverland-green text-white font-bold py-4 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Enviando...
                                        </div>
                                    ) : (
                                        'Enviar Mensaje'
                                    )}
                                </button>
                                
                                {/* Status Message */}
                                {submitStatus !== 'idle' && (
                                    <div className={`mt-4 p-4 rounded-lg ${
                                        submitStatus === 'success' 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        <div className="flex items-center">
                                            {submitStatus === 'success' ? (
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <span className="font-medium">{submitMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-inverland-dark mb-4">
                            Nuestra Ubicación
                        </h2>
                        <p className="text-lg text-gray-600">
                            Visítanos en nuestras oficinas en León, Guanajuato
                        </p>
                    </div>
                    
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden" style={{ height: '400px' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.123456789!2d-101.69164941912484!3d21.14519209685408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzQyLjgiTiAxMDHCsDQxJzI5LjQiVw!5e0!3m2!1ses!2smx!4v1234567890123!5m2!1ses!2smx"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación de Inverland - Nubes 219, Jardines del Moral, León, Guanajuato"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-ileana-navy to-ileana-orange text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            ¿Listo para encontrar tu próxima propiedad?
                        </h2>
                        <p className="text-xl mb-8 text-orange-100">
                            Nuestro equipo de expertos está aquí para ayudarte en cada paso del proceso.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="tel:+524777871635" className="bg-white text-ileana-navy font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-lg">
                                Llamar Ahora
                            </a>
                            <a href="https://wa.me/524777871635" target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-ileana-navy transition-colors duration-300">
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
