import React from 'react';

const ScrollingBanner: React.FC = () => {
    const bannerText = "¿Deseas vender, comprar o rentar? Nosotros nos encargamos";

    const BannerContent: React.FC = () => (
        <span className="text-lg font-medium mx-8 flex items-center">
            {bannerText}
            <a href="#contact" className="ml-4 bg-inverland-green text-white font-bold px-4 py-1 rounded-full hover:bg-opacity-90 transition-transform duration-300 transform hover:scale-105 text-sm whitespace-nowrap">
                Contáctanos
            </a>
        </span>
    );

    return (
        <div className="bg-inverland-blue text-white py-3 overflow-hidden" role="banner">
            <div className="flex animate-scroll whitespace-nowrap w-max">
                {/* Repeat content for seamless scroll */}
                <BannerContent />
                <BannerContent />
                <BannerContent />
                <BannerContent />
            </div>
        </div>
    );
};

export default ScrollingBanner;