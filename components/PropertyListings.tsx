

import React, { useState, useMemo, useRef } from 'react';
import { Property, PropertyFilters } from '../types';
import MapView from './MapView';
import Pagination from './Pagination';
import PriceRangeSlider from './PriceRangeSlider';
import { PRICE_RANGE } from '../constants';

interface PropertyListingsProps {
    properties: Property[];
    filters: Partial<PropertyFilters>;
    setFilters: React.Dispatch<React.SetStateAction<Partial<PropertyFilters>>>;
    onViewProperty: (property: Property) => void;
}

interface PropertyCardProps {
    property: Property;
    onViewProperty: (property: Property) => void;
    onMouseEnter: (property: Property, e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewProperty, onMouseEnter, onMouseLeave }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    const getValidImageSrc = (src?: string) => {
        if (!src) return 'https://picsum.photos/600/400?grayscale';
        const isValid = src.startsWith('http') || src.startsWith('data:');
        return isValid ? src : 'https://picsum.photos/600/400?grayscale';
    };

    const displayPrice = property.operationType.includes('Renta') && (property.rentPrice ?? 0) > 0
        ? formatPrice(property.rentPrice as number)
        : formatPrice(property.price);

    return (
        <div 
            onClick={() => onViewProperty(property)} 
            onMouseEnter={(e) => onMouseEnter(property, e)}
            onMouseLeave={onMouseLeave}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out cursor-pointer group"
        >
            <div className="relative">
                <img src={getValidImageSrc(property.images[0])} alt={property.title} className="w-full h-56 object-cover" />
                <div className="absolute top-4 left-4 bg-inverland-green text-white px-3 py-1 text-sm font-semibold rounded-full">{property.type}</div>
                <div className={`absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-full ${
                    property.operationType.includes('Renta') 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                }`}>
                    {property.operationType.includes('Renta') ? 'For Rent' : 'For Sale'}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{property.title}</h3>
                    <p className="text-sm">{property.location}</p>
                </div>
            </div>
            <div className="p-6">
                <p className="text-2xl font-extrabold text-inverland-dark mb-4">{displayPrice}</p>
                <div className="flex justify-around text-gray-600 border-t pt-4">
                    <span className="text-sm">🛏️ {property.bedrooms} hab.</span>
                    <span className="text-sm">🛁 {property.bathrooms} baños</span>
                    {/* FIX: Property 'area' does not exist on type 'Property'. Replaced with 'constructionArea'. */}
                    <span className="text-sm">🏠 {property.constructionArea} m²</span>
                </div>
            </div>
        </div>
    );
};

const PropertyListings: React.FC<PropertyListingsProps> = ({ properties, filters, setFilters, onViewProperty }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 9;
    const [preview, setPreview] = useState<{ property: Property, position: { top: number, left: number } } | null>(null);
    const previewTimeoutRef = useRef<number | null>(null);

    const handleMouseEnter = (property: Property, e: React.MouseEvent<HTMLDivElement>) => {
        if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
        }
        
        const cardElement = e.currentTarget; // Persist the element reference

        previewTimeoutRef.current = window.setTimeout(() => {
            if (!cardElement) return;
            const rect = cardElement.getBoundingClientRect();
            const previewWidth = 320; // w-80
            const previewHeight = 350; // estimated
            const gap = 16;

            let top = rect.top;
            let left = rect.right + gap;

            if (left + previewWidth > window.innerWidth) {
                left = rect.left - previewWidth - gap;
            }

            if (top + previewHeight > window.innerHeight - gap) {
                top = window.innerHeight - previewHeight - gap;
            }
            
            if (top < gap) {
                top = gap;
            }

            setPreview({ property, position: { top, left } });
        }, 200);
    };

    const handleMouseLeave = () => {
        if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
        }
        setPreview(null);
    };
    
    const availableAmenities = useMemo(() => {
        const allAmenities = properties.flatMap(p => p.amenities);
        return [...new Set(allAmenities)].sort();
    }, [properties]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFilters(prev => {
            const currentAmenities = prev.amenities || [];
            if (currentAmenities.includes(amenity)) {
                return { ...prev, amenities: currentAmenities.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...currentAmenities, amenity] };
            }
        });
    };
    
    const handlePriceChange = ({ min, max }: { min: number; max: number }) => {
        setFilters(prev => ({ ...prev, minPrice: String(min), maxPrice: String(max) }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            if (filters.type && p.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
            if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
            if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
            if (filters.bedrooms && p.bedrooms < Number(filters.bedrooms)) return false;
            if (filters.bathrooms && p.bathrooms < Number(filters.bathrooms)) return false;
            if (filters.amenities && filters.amenities.length > 0) {
                if (!filters.amenities.every(a => p.amenities.includes(a))) return false;
            }
            return true;
        });
    }, [properties, filters]);

    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    const paginatedProperties = filteredProperties.slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    return (
        <section id="properties" className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1 bg-white p-4 md:p-6 rounded-lg shadow-lg self-start lg:sticky top-28">
                        <h3 className="text-2xl font-bold text-inverland-dark mb-6 border-b pb-4">Filtrar Propiedades</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Propiedad</label>
                                <input type="text" name="type" value={filters.type || ''} onChange={handleFilterChange} className="mt-1 block w-full filter-input" placeholder="Ej: Casa"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                <input type="text" name="location" value={filters.location || ''} onChange={handleFilterChange} className="mt-1 block w-full filter-input" placeholder="Ej: Querétaro"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precios</label>
                                <PriceRangeSlider 
                                    min={PRICE_RANGE.min}
                                    max={PRICE_RANGE.max}
                                    onChange={handlePriceChange}
                                    value={{ min: Number(filters.minPrice) || PRICE_RANGE.min, max: Number(filters.maxPrice) || PRICE_RANGE.max }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Habitaciones</label>
                                    <input type="number" name="bedrooms" min="0" value={filters.bedrooms || ''} onChange={handleFilterChange} className="mt-1 block w-full filter-input" placeholder="Mín."/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Baños</label>
                                    <input type="number" name="bathrooms" min="0" value={filters.bathrooms || ''} onChange={handleFilterChange} className="mt-1 block w-full filter-input" placeholder="Mín."/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amenidades</label>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                    {availableAmenities.map(amenity => (
                                        <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={(filters.amenities || []).includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="h-4 w-4 text-inverland-green rounded border-gray-300 focus:ring-inverland-green"/>
                                            <span className="text-gray-700 capitalize text-sm">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={clearFilters} className="w-full text-center py-2 text-sm font-semibold text-inverland-blue hover:text-inverland-dark transition-colors">Limpiar Filtros</button>
                        </div>
                    </aside>

                    {/* Listings */}
                    <main className="lg:col-span-3">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                             <p className="text-gray-600 font-medium">{filteredProperties.length} propiedades encontradas</p>
                            <div className="flex items-center space-x-2 bg-gray-200 p-1 rounded-lg">
                                <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-sm rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-inverland-dark shadow' : 'text-gray-600'}`}>Grid</button>
                                <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm rounded-md transition-colors ${viewMode === 'map' ? 'bg-white text-inverland-dark shadow' : 'text-gray-600'}`}>Mapa</button>
                            </div>
                        </div>

                        {viewMode === 'grid' ? (
                            <>
                                {paginatedProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                        {paginatedProperties.map(prop => <PropertyCard 
                                            key={prop.id} 
                                            property={prop} 
                                            onViewProperty={onViewProperty}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        />)}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                                        <h3 className="text-2xl font-semibold text-gray-700">No se encontraron propiedades</h3>
                                        <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
                                    </div>
                                )}
                                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
                            </>
                        ) : (
                            <MapView properties={filteredProperties} onViewProperty={onViewProperty} />
                        )}
                    </main>
                </div>
                {preview && (
                    <div 
                        className="fixed bg-white w-80 rounded-lg shadow-2xl p-4 z-50 pointer-events-none animate-fade-in hidden lg:block" // Hidden on mobile
                        style={{ top: `${preview.position.top}px`, left: `${preview.position.left}px` }}
                        role="tooltip"
                    >
                        <div className="relative">
                            <img 
                                src={(() => { const s = preview.property.images[0]; return s && (s.startsWith('http') || s.startsWith('data:')) ? s : 'https://picsum.photos/600/400?grayscale'; })()} 
                                alt={preview.property.title} 
                                className="w-full h-40 object-cover rounded-md mb-3" 
                            />
                            <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                preview.property.operationType.includes('Renta') 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-green-500 text-white'
                            }`}>
                                {preview.property.operationType.includes('Renta') ? 'For Rent' : 'For Sale'}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-inverland-dark truncate">{preview.property.title}</h3>
                        <p className="text-2xl font-extrabold text-inverland-dark my-2">
                            {(() => {
                                const isRent = preview.property.operationType.includes('Renta');
                                const amount = isRent && (preview.property.rentPrice ?? 0) > 0
                                    ? (preview.property.rentPrice as number)
                                    : preview.property.price;
                                return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
                            })()}
                        </p>
                        <div className="flex justify-around text-gray-600 border-t pt-2 text-sm">
                            <span>🛏️ {preview.property.bedrooms} hab.</span>
                            <span>🛁 {preview.property.bathrooms} baños</span>
                            {/* FIX: Property 'area' does not exist on type 'Property'. Replaced with 'constructionArea'. */}
                            <span>🏠 {preview.property.constructionArea} m²</span>
                        </div>
                    </div>
                )}
                <style>{`.filter-input { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .filter-input:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }`}</style>
            </div>
        </section>
    );
};

export default PropertyListings;