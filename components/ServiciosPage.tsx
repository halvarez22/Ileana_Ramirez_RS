import React from 'react';

interface Servicio {
    componente: string;
    significado: string;
    beneficio: string;
}

const servicios: Servicio[] = [
    {
        componente: "Acompañamiento Personalizado",
        significado: "Un experto de Iliana Ramirez Real State te guía en cada paso, desde la búsqueda hasta la firma.",
        beneficio: "Ahorro de Tiempo y Esfuerzo."
    },
    {
        componente: "Certeza Legal (Blindaje)",
        significado: "Revisamos a detalle la documentación legal, gravámenes y permisos. Operamos con un \"Due Diligence\" exhaustivo de estándar internacional.",
        beneficio: "Máxima Seguridad Jurídica. Evitas fraudes y problemas a futuro."
    },
    {
        componente: "Gestión Notarial Eficiente",
        significado: "Coordinamos y preparamos todos los documentos para la firma ante Notario, asegurando un proceso rápido y sin contratiempos.",
        beneficio: "Rapidez y Transparencia."
    },
    {
        componente: "Asesoría Fiscal Básica",
        significado: "Te orientamos sobre los impuestos y gastos de escrituración asociados a tu operación de compra o venta.",
        beneficio: "Claridad en tus Costos. Sabes exactamente lo que pagarás."
    },
    {
        componente: "Representación y Gestión",
        significado: "Si no puedes estar presente, podemos representarte legalmente para avanzar en los trámites con un poder notarial.",
        beneficio: "Flexibilidad Total (Ideal para mexicanos en el extranjero)."
    }
];

const ServiciosPage: React.FC = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-ileana-navy to-ileana-navy/90 text-ileana-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
                            Nuestros Servicios
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-orange-100 leading-relaxed px-2">
                            En Iliana Ramirez Real State no solo vendemos propiedades, te acompañamos en todo el proceso con servicios especializados que garantizan tu tranquilidad y éxito.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Content */}
            <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Servicios Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {servicios.map((servicio, index) => (
                        <div 
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            {/* Componente */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-ileana-navy mb-3">
                                    {servicio.componente}
                                </h3>
                                <div className="w-16 h-1 bg-gradient-to-r from-ileana-navy to-ileana-orange rounded-full"></div>
                            </div>

                            {/* ¿Qué significa para ti? */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-ileana-navy mb-3 flex items-center">
                                    <span className="bg-ileana-orange/10 text-ileana-orange p-2 rounded-lg mr-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    ¿Qué significa para ti?
                                </h4>
                                <p className="text-gray-700 leading-relaxed pl-11">
                                    {servicio.significado}
                                </p>
                            </div>

                            {/* Beneficio Clave */}
                            <div className="bg-gradient-to-r from-ileana-orange/5 to-ileana-navy/5 p-4 rounded-xl border-l-4 border-ileana-orange">
                                <h4 className="text-lg font-semibold text-ileana-navy mb-2 flex items-center">
                                    <span className="bg-ileana-orange/10 text-ileana-orange p-2 rounded-lg mr-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </span>
                                    Beneficio Clave
                                </h4>
                                <p className="text-ileana-navy font-medium pl-11">
                                    {servicio.beneficio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-ileana-navy to-ileana-orange text-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        ¿Listo para experimentar nuestros servicios?
                    </h2>
                    <p className="text-xl mb-8 text-orange-100">
                        Contáctanos y descubre cómo podemos hacer que tu experiencia inmobiliaria sea excepcional.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-ileana-navy font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-lg">
                            Ver Propiedades
                        </button>
                        <button className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-ileana-navy transition-colors duration-300">
                            Contactar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </section>
        </div>
    );
};

export default ServiciosPage;

