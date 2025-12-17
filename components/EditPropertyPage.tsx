import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { PROPERTY_TYPES } from '../constants';
import { useProperties } from './PropertyContext';

// Función para comprimir imágenes (igual que en AddProperty)
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo proporción
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convertir a DataURL con compresión
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

// Utilidades para URL
const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
};

const isValidHttpUrl = (s: string): boolean => {
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

interface EditPropertyPageProps {
    onBack: () => void;
}

const EditPropertyPage: React.FC<EditPropertyPageProps> = ({ onBack }) => {
    const { properties, updateProperty, deleteProperty } = useProperties();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Omit<Property, 'id' | 'images' | 'videos' | 'location'>>({
        title: '',
        description: '',
        type: PROPERTY_TYPES[0],
        operationType: 'Venta',
        price: 0,
        rentPrice: 0,
        showPrice: true,
        bedrooms: 0,
        bathrooms: 0,
        halfBathrooms: 0,
        parkingSpaces: 0,
        constructionArea: 0,
        landArea: 0,
        landDepth: 0,
        landFront: 0,
        constructionYear: undefined,
        floorNumber: undefined,
        buildingFloors: undefined,
        maintenanceFee: 0,
        internalKey: '',
        keyLockerCode: '',
        country: 'México',
        state: '',
        city: '',
        neighborhood: '',
        street: '',
        streetNumber: '',
        interiorNumber: '',
        crossStreet: '',
        zipCode: '',
        showExactLocation: true,
        latitude: 19.4326,
        longitude: -99.1332,
        amenities: [],
        status: 'For Sale',
        mainPhotoIndex: 0,
        videos: [],
        video360: '',
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [video360Urls, setVideo360Urls] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'number' && value === '') {
            setFormData(prev => ({ ...prev, [name]: undefined }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addVideoUrl = () => {
        const url = prompt('Ingresa la URL del video de YouTube:');
        if (url && url.trim()) {
            // Validar que sea una URL de YouTube
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                setVideoUrls(prev => [...prev, url.trim()]);
            } else {
                alert('Por favor ingresa una URL válida de YouTube');
            }
        }
    };

    const removeVideoUrl = (index: number) => {
        setVideoUrls(prev => prev.filter((_, i) => i !== index));
    };

    const editVideoUrl = (index: number) => {
        const current = videoUrls[index] || '';
        const input = prompt('Edita la URL del video de YouTube:', current);
        if (!input) return;
        const value = input.trim();
        if (!(value.includes('youtube.com') || value.includes('youtu.be'))) {
            alert('Por favor ingresa una URL válida de YouTube');
            return;
        }
        setVideoUrls(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const addVideo360Url = () => {
        const input = prompt('Ingresa la URL del recorrido virtual 360°:');
        if (!input) return;
        const normalized = normalizeUrl(input);
        if (!isValidHttpUrl(normalized)) {
            alert('Por favor ingresa una URL válida (http/https).');
            return;
        }
        setVideo360Urls(prev => {
            if (prev.includes(normalized)) return prev; // evitar duplicados
            return [...prev, normalized];
        });
    };

    const removeVideo360Url = (index: number) => {
        setVideo360Urls(prev => prev.filter((_, i) => i !== index));
    };

    // Función para manejar cambio de archivos de imagen
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Verificar límite de 10 fotos por propiedad (usar previews como fuente de verdad)
            const currentImageCount = imagePreviews.length;
            const newFilesCount = files.length;
            const maxRemaining = Math.max(0, 10 - currentImageCount);
            if (maxRemaining <= 0) {
                alert('Máximo 10 fotos por propiedad. Ya tienes 10 fotos.');
                return;
            }
            if (newFilesCount > maxRemaining) {
                alert(`Máximo 10 fotos por propiedad. Actualmente tienes ${currentImageCount} fotos y estás intentando agregar ${newFilesCount}. Solo se agregarán ${maxRemaining} fotos.`);
                const allowedFiles = files.slice(0, maxRemaining);
                setImageFiles(prev => [...prev, ...allowedFiles]);
                // Convertir archivos a data URLs para persistencia
                const newPreviews = await Promise.all(allowedFiles.map(async file => {
                    const compressed = await compressImage(file, 800, 0.7);
                    return compressed; // Ya es data URL
                }));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            } else {
                setImageFiles(prev => [...prev, ...files]);
                // Convertir archivos a data URLs para persistencia
                const newPreviews = await Promise.all(files.map(async file => {
                    const compressed = await compressImage(file, 800, 0.7);
                    return compressed; // Ya es data URL
                }));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };
    
    const removeFile = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        
        // Ajustar el índice de la foto principal si es necesario
        if (index === mainPhotoIndex) {
            setMainPhotoIndex(0); // Volver a la primera foto
        } else if (index < mainPhotoIndex) {
            setMainPhotoIndex(prev => prev - 1); // Ajustar índice
        }
    };

    const setMainPhoto = (index: number) => {
        setMainPhotoIndex(index);
    };

    const handlePropertySelect = (property: Property) => {
        setSelectedProperty(property);
        setIsEditing(true);
        
        // Cargar datos de la propiedad en el formulario
        setFormData({
            title: property.title,
            description: property.description,
            type: property.type,
            operationType: property.operationType,
            price: property.price,
            rentPrice: property.rentPrice || 0,
            showPrice: property.showPrice,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            halfBathrooms: property.halfBathrooms || 0,
            parkingSpaces: property.parkingSpaces,
            constructionArea: property.constructionArea,
            landArea: property.landArea || 0,
            landDepth: property.landDepth || 0,
            landFront: property.landFront || 0,
            constructionYear: property.constructionYear,
            floorNumber: property.floorNumber,
            buildingFloors: property.buildingFloors,
            maintenanceFee: property.maintenanceFee || 0,
            internalKey: property.internalKey || '',
            keyLockerCode: property.keyLockerCode || '',
            country: property.country,
            state: property.state,
            city: property.city,
            neighborhood: property.neighborhood || '',
            street: property.street,
            streetNumber: property.streetNumber || '',
            interiorNumber: property.interiorNumber || '',
            crossStreet: property.crossStreet || '',
            zipCode: property.zipCode || '',
            showExactLocation: property.showExactLocation || true,
            latitude: property.latitude,
            longitude: property.longitude,
            amenities: property.amenities,
            status: property.status,
            mainPhotoIndex: property.mainPhotoIndex || 0,
        });

        // Cargar imágenes existentes
        setImagePreviews(property.images);
        setMainPhotoIndex(property.mainPhotoIndex || 0);
        
        // Cargar videos existentes
        setVideoUrls(property.videos || []);
        const v360 = property.video360;
        setVideo360Urls(Array.isArray(v360) ? v360 : (v360 ? [v360] : []));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty) return;

        setIsLoading(true);

        try {
            // Las imágenes ya están comprimidas como data URLs en imagePreviews
            const allImages = imagePreviews;

            const locationString = `${formData.city}, ${formData.state}`;

            const updatedProperty: Property = {
                ...selectedProperty,
                ...formData,
                location: locationString,
                images: allImages, // Imágenes existentes + nuevas comprimidas
                videos: videoUrls, // URLs de YouTube
                video360: video360Urls, // URLs del recorrido 360
                mainPhotoIndex: mainPhotoIndex,
            };
            
            updateProperty(updatedProperty);
            alert('Propiedad actualizada exitosamente');
            setIsEditing(false);
            setSelectedProperty(null);

        } catch (error) {
            console.error("Error updating property:", error);
            alert("Hubo un error al actualizar la propiedad. Por favor, inténtelo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProperty = async () => {
        if (!selectedProperty) return;

        // Validaciones de seguridad para eliminar propiedad
        const canDelete = await validatePropertyDeletion(selectedProperty);
        
        if (!canDelete.canDelete) {
            alert(`❌ No se puede eliminar esta propiedad:\n\n${canDelete.reason}`);
            return;
        }

        // Confirmación final
        const confirmDelete = window.confirm(
            `⚠️ ¿Estás seguro de que deseas eliminar esta propiedad?\n\n` +
            `📋 Propiedad: ${selectedProperty.title}\n` +
            `📍 Ubicación: ${selectedProperty.location}\n\n` +
            `Esta acción NO se puede deshacer.`
        );

        if (!confirmDelete) return;

        try {
            setIsLoading(true);
            await deleteProperty(selectedProperty.id);
            alert('✅ Propiedad eliminada exitosamente');
            
            // Limpiar formulario y volver a la lista
            setIsEditing(false);
            setSelectedProperty(null);
            resetForm();
            
        } catch (error) {
            console.error("Error deleting property:", error);
            alert("❌ Hubo un error al eliminar la propiedad. Por favor, inténtelo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const validatePropertyDeletion = async (property: Property): Promise<{ canDelete: boolean; reason: string }> => {
        // Por ahora, todas las propiedades se pueden eliminar ya que no están asignadas a agentes
        // En el futuro, aquí se validarán:
        // - Si está asignada a un agente
        // - Si tiene seguimientos/actividades
        // - Si tiene clientes asignados
        // - Si tiene campañas activas
        
        return {
            canDelete: true,
            reason: "✅ Propiedad disponible para eliminación"
        };
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: PROPERTY_TYPES[0],
            operationType: 'Venta',
            price: 0,
            rentPrice: 0,
            showPrice: true,
            bedrooms: 0,
            bathrooms: 0,
            halfBathrooms: 0,
            parkingSpaces: 0,
            constructionArea: 0,
            landArea: 0,
            landDepth: 0,
            landFront: 0,
            constructionYear: 0,
            floorNumber: 0,
            buildingFloors: 0,
            maintenanceFee: 0,
            internalKey: '',
            keyLockerCode: '',
            country: 'México',
            state: '',
            city: '',
            neighborhood: '',
            street: '',
            streetNumber: '',
            interiorNumber: '',
            crossStreet: '',
            zipCode: '',
            showExactLocation: true,
            latitude: 0,
            longitude: 0,
            amenities: [],
            status: 'Disponible',
            mainPhotoIndex: 0,
        });
        setImageFiles([]);
        setImagePreviews([]);
        setVideoUrls([]);
        setVideo360Urls([]);
        setMainPhotoIndex(0);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setSelectedProperty(null);
        setFormData({
            title: '',
            description: '',
            type: PROPERTY_TYPES[0],
            operationType: 'Venta',
            price: 0,
            rentPrice: 0,
            showPrice: true,
            bedrooms: 0,
            bathrooms: 0,
            halfBathrooms: 0,
            parkingSpaces: 0,
            constructionArea: 0,
            landArea: 0,
            landDepth: 0,
            landFront: 0,
            constructionYear: undefined,
            floorNumber: undefined,
            buildingFloors: undefined,
            maintenanceFee: 0,
            internalKey: '',
            keyLockerCode: '',
            country: 'México',
            state: '',
            city: '',
            neighborhood: '',
            street: '',
            streetNumber: '',
            interiorNumber: '',
            crossStreet: '',
            zipCode: '',
            showExactLocation: true,
            latitude: 19.4326,
            longitude: -99.1332,
            amenities: [],
            status: 'For Sale',
            mainPhotoIndex: 0,
        });
    };

    if (isEditing) {
        return (
            <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-extrabold text-inverland-black">Editar Propiedad</h2>
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Información Básica */}
                                <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                                    <legend className="text-xl font-bold px-2 text-inverland-black">Información Básica</legend>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Título *</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full input-style"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipo de Propiedad *</label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full input-style"
                                            >
                                                {PROPERTY_TYPES.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows={4}
                                            className="mt-1 block w-full input-style"
                                        />
                                    </div>
                                </fieldset>

                                {/* Características */}
                                <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                                    <legend className="text-xl font-bold px-2 text-inverland-black">Características</legend>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                        {/* Campos para CASAS */}
                                        {formData.type === 'Casa' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Recámaras</label>
                                                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Baños</label>
                                                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Medios baños</label>
                                                    <input type="number" name="halfBathrooms" value={formData.halfBathrooms} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Estacionamientos</label>
                                                    <input type="number" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Construcción (m²)</label>
                                                    <input type="number" name="constructionArea" value={formData.constructionArea} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Terreno (m²)</label>
                                                    <input type="number" name="landArea" value={formData.landArea} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Fondo (m)</label>
                                                    <input type="number" name="landDepth" value={formData.landDepth} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Frente (m)</label>
                                                    <input type="number" name="landFront" value={formData.landFront} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Año const.</label>
                                                    <input type="number" name="constructionYear" value={formData.constructionYear || ''} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                            </>
                                        )}

                                        {/* Campos para DEPARTAMENTOS */}
                                        {formData.type === 'Departamento' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Recámaras</label>
                                                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Baños</label>
                                                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Medios baños</label>
                                                    <input type="number" name="halfBathrooms" value={formData.halfBathrooms} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Estacionamientos</label>
                                                    <input type="number" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Construcción (m²)</label>
                                                    <input type="number" name="constructionArea" value={formData.constructionArea} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Piso</label>
                                                    <input type="number" name="floorNumber" value={formData.floorNumber || ''} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Pisos edif.</label>
                                                    <input type="number" name="buildingFloors" value={formData.buildingFloors || ''} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Año const.</label>
                                                    <input type="number" name="constructionYear" value={formData.constructionYear || ''} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Mantenim.</label>
                                                    <input type="number" name="maintenanceFee" value={formData.maintenanceFee} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                            </>
                                        )}

                                        {/* Campos para TERRENOS */}
                                        {formData.type === 'Terreno' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Terreno (m²)</label>
                                                    <input type="number" name="landArea" value={formData.landArea} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Fondo (m)</label>
                                                    <input type="number" name="landDepth" value={formData.landDepth} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Frente (m)</label>
                                                    <input type="number" name="landFront" value={formData.landFront} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </fieldset>

                                {/* Precio */}
                                <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                                    <legend className="text-xl font-bold px-2 text-inverland-black">Precio</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Precio de Venta *</label>
                                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Precio de Renta</label>
                                            <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Ubicación */}
                                <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                                    <legend className="text-xl font-bold px-2 text-inverland-black">Ubicación</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Estado *</label>
                                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ciudad *</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Colonia</label>
                                            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Calle *</label>
                                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                                        </div>
                                    </div>
                                    
                                    {/* Coordenadas */}
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Coordenadas GPS</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Latitud</label>
                                                <input 
                                                    type="number" 
                                                    name="latitude" 
                                                    value={formData.latitude} 
                                                    onChange={handleInputChange} 
                                                    step="any"
                                                    placeholder="Ej: 21.1452314838769"
                                                    className="mt-1 block w-full input-style" 
                                                />
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Coordenada norte-sur (ej: 21.1452314838769)
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Longitud</label>
                                                <input 
                                                    type="number" 
                                                    name="longitude" 
                                                    value={formData.longitude} 
                                                    onChange={handleInputChange} 
                                                    step="any"
                                                    placeholder="Ej: -101.69151450378543"
                                                    className="mt-1 block w-full input-style" 
                                                />
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Coordenada este-oeste (ej: -101.69151450378543)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Consejo:</strong> Puedes obtener las coordenadas exactas usando Google Maps. 
                                                Haz clic derecho en la ubicación y selecciona "¿Qué hay aquí?" para ver las coordenadas.
                                            </p>
                                            <div className="mt-3 p-2 bg-white rounded border">
                                                <p className="text-xs text-gray-600">
                                                    <strong>Coordenadas actuales:</strong><br/>
                                                    Latitud: {formData.latitude}<br/>
                                                    Longitud: {formData.longitude}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Imágenes */}
                                <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                                    <legend className="text-xl font-bold px-2 text-inverland-black">Imágenes</legend>
                                    
                                    {/* Subir nuevas imágenes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Agregar Nuevas Imágenes
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({imagePreviews.length}/10 fotos)
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-inverland-blue file:text-white hover:file:bg-inverland-light-blue"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Máximo 10 fotos por propiedad. Las imágenes se comprimirán automáticamente.
                                        </p>
                                    </div>

                                    {/* Vista previa de imágenes */}
                                    {(imagePreviews.length > 0 || imageFiles.length > 0) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Vista Previa de Imágenes
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setMainPhoto(index)}
                                                                    className={`px-3 py-1 text-xs rounded ${
                                                                        mainPhotoIndex === index 
                                                                            ? 'bg-yellow-500 text-white' 
                                                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {mainPhotoIndex === index ? '⭐ Principal' : '⭐ Principal'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(index)}
                                                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {mainPhotoIndex === index && (
                                                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                                ⭐ Principal
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </fieldset>

                                {/* Videos */}
                                <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                                    <legend className="text-xl font-bold px-2 text-inverland-black">Videos</legend>
                                    
                                    {/* Videos de YouTube */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Videos de YouTube
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({videoUrls.length} videos)
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addVideoUrl}
                                            className="mb-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            + Agregar Video de YouTube
                                        </button>
                                        {videoUrls.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {videoUrls.map((url, index) => (
                                                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-gray-600 flex-1 truncate">{url}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => editVideoUrl(index)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVideoUrl(index)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <hr className="my-4 border-gray-200" />
                                    {/* Video 360 (Recorridos Virtuales) */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recorridos Virtuales 360°
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({video360Urls.length} recorridos)
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addVideo360Url}
                                            className="mb-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            + Agregar Recorrido 360
                                        </button>
                                        {video360Urls.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {video360Urls.map((url, index) => (
                                                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-gray-600 flex-1 truncate">{url}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const input = prompt('Edita la URL del recorrido 360°:', url);
                                                                if (!input) return;
                                                                const normalized = normalizeUrl(input);
                                                                if (!isValidHttpUrl(normalized)) { alert('Por favor ingresa una URL válida (http/https).'); return; }
                                                                setVideo360Urls(prev => {
                                                                    const next = [...prev];
                                                                    next[index] = normalized;
                                                                    return next;
                                                                });
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVideo360Url(index)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </fieldset>

                                {/* Botones */}
                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={handleDeleteProperty}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Eliminando...' : '🗑️ Eliminar Propiedad'}
                                    </button>
                                    <div className="flex space-x-4">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-inverland-blue text-white rounded-lg hover:bg-inverland-light-blue transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-extrabold text-inverland-black">Edición de Fichas</h2>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-inverland-blue text-white rounded-lg hover:bg-inverland-light-blue transition-colors"
                        >
                            Volver al Portal
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-inverland-black mb-6">Selecciona una propiedad para editar</h3>
                        
                        {properties.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No hay propiedades registradas para editar.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handlePropertySelect(property)}
                                    >
                                        <img
                                            src={property.images[property.mainPhotoIndex || 0] || 'https://picsum.photos/300/200?grayscale'}
                                            alt={property.title}
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                        <h4 className="font-bold text-lg text-inverland-black mb-2">{property.title}</h4>
                                        <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                                        <p className="text-inverland-blue font-semibold">
                                            {(() => {
                                                const isRent = property.operationType.includes('Renta');
                                                const amount = isRent && (property.rentPrice ?? 0) > 0
                                                    ? (property.rentPrice as number)
                                                    : property.price;
                                                return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
                                            })()}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{property.type}</span>
                                            <span className={`text-sm px-2 py-1 rounded ${
                                                property.operationType.includes('Renta') 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {property.operationType.includes('Renta') ? 'For Rent' : property.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditPropertyPage;
