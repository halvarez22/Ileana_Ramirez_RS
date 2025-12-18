import React from 'react';

type View = 'home' | 'login' | 'dashboard' | 'userPortal' | 'propertyDetail' | 'addProperty' | 'editProperty' | 'agents' | 'tracking' | 'userManagement' | 'clients' | 'marketing' | 'analytics' | 'agentPortal' | 'clientDetail' | 'agentPropertyDetail' | 'about' | 'contact';

interface AboutPageProps {
    onNavigate: (view: View) => void;
    onNavigateToProperties: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onNavigateToProperties }) => {
    console.log('AboutPage - onNavigate:', onNavigate);
    console.log('AboutPage - onNavigateToProperties:', onNavigateToProperties);
    console.log('AboutPage - typeof onNavigate:', typeof onNavigate);
    console.log('AboutPage - typeof onNavigateToProperties:', typeof onNavigateToProperties);
    
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-ileana-navy to-ileana-navy/90 text-ileana-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
                            Sobre Nosotros
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-orange-100 leading-relaxed px-2">
                            En Iliana Ramirez Real State, entendemos que encontrar el lugar perfecto para llamar <strong>hogar</strong> es un paso crucial en la vida de cada persona.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ileana-navy mb-6 sm:mb-8 font-heading">
                                Nuestra Misión
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            {/* Imagen de Portada */}
                            <div className="order-2 lg:order-1">
                                <div className="relative rounded-2xl overflow-hidden shadow-ileana-lg">
                                    <img
                                        src="/images/caratula.png"
                                        alt="Iliana Ramirez Real State - Nuestra Misión"
                                        className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-ileana-navy/20 to-transparent"></div>
                                </div>
                            </div>
                            
                            {/* Texto de Misión */}
                            <div className="order-1 lg:order-2">
                                <div className="bg-white rounded-2xl shadow-ileana-lg p-6 sm:p-8 md:p-10 lg:p-12 border border-ileana-orange/20">
                                    <p className="text-base sm:text-lg md:text-xl text-ileana-navy leading-relaxed font-body">
                                        Nuestra misión es proporcionar a nuestros clientes un <strong className="text-ileana-orange">servicio personalizado</strong> y de <strong className="text-ileana-orange">alta calidad</strong>,
                                        centrado en la protección y <strong className="text-ileana-orange">gestión ética</strong> de su <strong className="text-ileana-orange">patrimonio</strong> de manera profesional y transparente.
                                    </p>
                                    
                                    <div className="mt-6 sm:mt-8">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-ileana-navy to-ileana-orange rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-ileana-navy font-heading">Compromiso Total</h3>
                                                <p className="text-sm text-ileana-orange font-body">Con cada cliente y proyecto</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-ileana-navy mb-4">
                            Nuestros Valores
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Los principios que guían cada una de nuestras acciones y decisiones
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Value 1 */}
                        <div className="bg-gradient-to-br from-ileana-navy/5 to-ileana-orange/5 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-ileana-orange/20">
                            <div className="w-16 h-16 bg-ileana-navy rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-ileana-navy mb-4">
                                Honestidad y Transparencia
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Nuestro personal está capacitado para actuar de manera profesional, leal y ética en todas sus interacciones 
                                con las personas, asegurando la transparencia en cada transacción.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-gradient-to-br from-ileana-orange/5 to-ileana-navy/5 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-ileana-navy/20">
                            <div className="w-16 h-16 bg-ileana-orange rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-ileana-navy mb-4">
                                Colaboración
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Fomentamos la colaboración activa entre todos los miembros de nuestro equipo, trabajando juntos para 
                                alcanzar un objetivo común que se traduzca en una experiencia mejorada para nuestros clientes.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-gradient-to-br from-ileana-navy/5 to-ileana-orange/5 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-ileana-orange/20">
                            <div className="w-16 h-16 bg-ileana-orange rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-ileana-navy mb-4">
                                Servicio
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                La satisfacción de nuestros clientes es nuestra máxima prioridad en cada trámite y proceso inmobiliario. 
                                La confianza que depositan en nosotros es nuestro mayor logro.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 md:py-24 bg-ileana-navy text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Nuestro Impacto
                        </h2>
                        <p className="text-xl text-orange-100">
                            Transformando el panorama inmobiliario de México
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-ileana-orange mb-2">500+</div>
                            <div className="text-orange-100">Propiedades Gestionadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-ileana-orange mb-2">1000+</div>
                            <div className="text-orange-100">Clientes Satisfechos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-ileana-orange mb-2">15+</div>
                            <div className="text-orange-100">Años de Experiencia</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-ileana-orange mb-2">50+</div>
                            <div className="text-orange-100">Agentes Especializados</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-ileana-navy to-ileana-orange text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            ¿Listo para encontrar tu hogar ideal?
                        </h2>
                        <p className="text-xl mb-8 text-orange-100">
                            Permítenos ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades y sueños.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => {
                                    console.log('Ver Propiedades clicked - onNavigateToProperties:', onNavigateToProperties);
                                    if (typeof onNavigateToProperties === 'function') {
                                        onNavigateToProperties();
                                    } else {
                                        console.error('onNavigateToProperties is not a function:', onNavigateToProperties);
                                    }
                                }}
                                className="bg-white text-ileana-navy font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Ver Propiedades
                            </button>
                            <button
                                onClick={() => {
                                    console.log('Contactar Ahora clicked - onNavigate:', onNavigate);
                                    if (typeof onNavigate === 'function') {
                                        onNavigate('contact');
                                    } else {
                                        console.error('onNavigate is not a function:', onNavigate);
                                    }
                                }}
                                className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-ileana-navy transition-colors duration-300"
                            >
                                Contactar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
