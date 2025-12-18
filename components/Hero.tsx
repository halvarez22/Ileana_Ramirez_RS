import React, { useState } from 'react';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

interface HeroProps {
    onSearch: (query: string) => void;
    isSearching: boolean;
}

const Hero: React.FC<HeroProps> = ({ onSearch, isSearching }) => {
    const [query, setQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <section id="home" className="relative h-screen min-h-[600px] md:min-h-[700px] flex items-center justify-center text-white">
            <img src="/images/caratula.png" alt="Iliana Ramirez Real State - Encuentra tu hogar ideal" className="absolute inset-0 w-full h-full object-cover" />
            
            <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
                <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
                    <img src="/images/logo.png" alt="Iliana Ramirez Real State Logo" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-lg" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 sm:mb-4 md:mb-6 drop-shadow-lg leading-tight">Encuentra tu hogar ideal con Iliana Ramirez</h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 drop-shadow-md px-2">Te ayudamos a encontrar la propiedad de tus sueños, con atención personalizada y resultados garantizados.</p>
                
                <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-2xl shadow-ileana-lg max-w-4xl mx-auto border border-white/20">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ej: Casa con alberca en Querétaro"
                            className="w-full flex-grow p-3 sm:p-4 rounded-xl border border-ileana-orange/30 bg-white text-ileana-black text-sm sm:text-base focus:ring-2 focus:ring-ileana-orange focus:border-ileana-orange outline-none min-h-[48px] font-body"
                            aria-label="Búsqueda de propiedades"
                        />
                        <button 
                            type="submit" 
                            disabled={isSearching}
                            className="w-full sm:w-auto bg-ileana-orange text-ileana-white font-bold p-3 sm:p-4 rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-ileana disabled:bg-orange-400 disabled:scale-100 disabled:cursor-not-allowed min-h-[48px] whitespace-nowrap font-heading"
                        >
                            {isSearching ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <SearchIcon />
                                    <span className="ml-2">Buscar</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Hero;