import React, { useState } from 'react';
import { useProperties } from './PropertyContext';
import { Property } from '../types';
import { PROPERTY_TYPES, AMENITIES_LIST } from '../constants';
import { generatePropertyDescription } from '../services/geminiService';

interface AddPropertyProps {
    onPropertyAdded: () => void;
}

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);


const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Función para comprimir imágenes
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

// Define InputField props for type safety
interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value?: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    children?: React.ReactNode;
}

// Moved InputField component outside of AddProperty to prevent re-definition on every render
const InputField: React.FC<InputFieldProps> = ({label, name, type="text", required=false, placeholder, value, onChange, children}) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        {children ? children : (
            <input type={type} name={name} id={name} required={required} placeholder={placeholder} value={value ?? ''} onChange={onChange} className="mt-1 block w-full input-style"/>
        )}
    </div>
);


const AddProperty: React.FC<AddPropertyProps> = ({ onPropertyAdded }) => {
    const { addProperty } = useProperties();
    
    const [formData, setFormData] = useState<Omit<Property, 'id' | 'images' | 'videos' | 'location'> & { latitude?: string | number; longitude?: string | number }>({
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
        latitude: '', // Coordenadas como string para preservar formato decimal
        longitude: '', // Coordenadas como string para preservar formato decimal
        amenities: [],
        status: 'For Sale',
        videos: [],
        video360: '',
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [video360Urls, setVideo360Urls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formattedPrice, setFormattedPrice] = useState<string>('');
    const [formattedRentPrice, setFormattedRentPrice] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'number' && value === '') {
             setFormData(prev => ({ ...prev, [name]: undefined }));
             return;
        }
        
        const isNumeric = ['price', 'rentPrice', 'bedrooms', 'bathrooms', 'halfBathrooms', 'parkingSpaces', 'constructionArea', 'landArea', 'landDepth', 'landFront', 'constructionYear', 'floorNumber', 'buildingFloors', 'maintenanceFee', 'latitude', 'longitude'].includes(name);

        if (isNumeric) {
            // Para coordenadas, manejar como texto para preservar formato decimal
            if (name === 'latitude' || name === 'longitude') {
                // DEBUG: Mostrar valor original
                console.log(`🔍 Coordenada ${name}:`, { original: value });
                
                // Permitir cualquier entrada de texto que parezca un número decimal
                if (value === '' || value === '-' || value === '.' || value === '-.' || 
                    value.match(/^-?\d*\.?\d*$/)) {
                    setFormData(prev => ({ ...prev, [name]: value }));
                } else {
                    // Si no es un formato válido, mantener el valor anterior
                    console.warn(`⚠️ Formato inválido para ${name}: ${value}`);
                }
            } else {
                setFormData(prev => ({ ...prev, [name]: Number(value) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === 'true' ? true : value === 'false' ? false : value }));
    }

    // Función para manejar pegado inteligente de coordenadas
    const handleCoordinatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').trim();
        const fieldName = e.currentTarget.name;
        
        console.log('🔍 Pegado detectado:', { fieldName, pastedText });
        
        // Detectar si el texto pegado contiene ambas coordenadas (separadas por coma, espacio, etc.)
        const coordinatePattern = /(-?\d+\.?\d*)\s*[,;]\s*(-?\d+\.?\d*)/;
        const match = pastedText.match(coordinatePattern);
        
        if (match) {
            const [, coord1Str, coord2Str] = match;
            const coord1 = parseFloat(coord1Str);
            const coord2 = parseFloat(coord2Str);
            
            console.log('🔍 Coordenadas detectadas:', { coord1, coord2 });
            
            // Determinar cuál es latitud y cuál es longitud basado en los rangos
            let latitude, longitude;
            
            // Para México, la latitud está entre 14-32 y longitud entre -118 a -86
            if (coord1 >= 14 && coord1 <= 32 && coord2 >= -118 && coord2 <= -86) {
                // coord1 es latitud, coord2 es longitud
                latitude = coord1;
                longitude = coord2;
            } else if (coord2 >= 14 && coord2 <= 32 && coord1 >= -118 && coord1 <= -86) {
                // coord2 es latitud, coord1 es longitud
                latitude = coord2;
                longitude = coord1;
            } else {
                // Usar rangos generales
                if (coord1 >= -90 && coord1 <= 90 && (coord2 < -90 || coord2 > 90)) {
                    latitude = coord1;
                    longitude = coord2;
                } else if (coord2 >= -90 && coord2 <= 90 && (coord1 < -90 || coord1 > 90)) {
                    latitude = coord2;
                    longitude = coord1;
                } else {
                    // Si ambos están en rango de latitud, usar el orden original
                    latitude = coord1;
                    longitude = coord2;
                }
            }
            
            // CORRECCIÓN: Redondear a 6 decimales para evitar problemas de precisión
            latitude = Math.round(latitude * 1000000) / 1000000;
            longitude = Math.round(longitude * 1000000) / 1000000;
            
            console.log('🔍 Coordenadas asignadas (redondeadas):', { latitude, longitude });
            
            // Actualizar ambos campos
            setFormData(prev => ({
                ...prev,
                latitude: latitude,
                longitude: longitude
            }));
        } else {
            // Si no es un par de coordenadas, pegar normalmente
            const numValue = parseFloat(pastedText);
            if (!isNaN(numValue)) {
                // Redondear también valores individuales
                const roundedValue = Math.round(numValue * 1000000) / 1000000;
                setFormData(prev => ({ ...prev, [fieldName]: roundedValue }));
            } else {
                // Si no es un número válido, mantener el texto para permitir escritura parcial
                setFormData(prev => ({ ...prev, [fieldName]: pastedText }));
            }
        }
    };
    
    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => {
            const currentAmenities = prev.amenities || [];
            if (currentAmenities.includes(amenity)) {
                return { ...prev, amenities: currentAmenities.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...currentAmenities, amenity] };
            }
        });
    };

    // Función para manejar políticas (radio buttons) - solo una opción por grupo
    const handlePolicyToggle = (selectedPolicy: string, conflictingPolicy: string) => {
        setFormData(prev => {
            const currentAmenities = prev.amenities || [];
            // Remover la política conflictiva si existe
            const filteredAmenities = currentAmenities.filter(a => a !== conflictingPolicy);
            // Agregar la política seleccionada si no existe
            if (!filteredAmenities.includes(selectedPolicy)) {
                return { ...prev, amenities: [...filteredAmenities, selectedPolicy] };
            }
            return { ...prev, amenities: filteredAmenities };
        });
    };
    
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
                const newPreviews = await Promise.all(allowedFiles.map(async (file: File) => {
                    const compressed = await compressImage(file, 800, 0.7);
                    return compressed; // Ya es data URL
                }));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            } else {
                setImageFiles(prev => [...prev, ...files]);
                // Convertir archivos a data URLs para persistencia
                const newPreviews = await Promise.all(files.map(async (file: File) => {
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

    // Función para formatear números con comas y punto decimal
    const formatNumber = (value: string): string => {
        // Remover caracteres no numéricos excepto punto decimal
        const cleanValue = value.replace(/[^0-9.]/g, '');
        
        // Si está vacío, retornar vacío
        if (!cleanValue) return '';
        
        // Separar parte entera y decimal
        const parts = cleanValue.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        
        // Formatear parte entera con comas
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Si hay parte decimal, agregarla
        if (decimalPart !== undefined) {
            return `${formattedInteger}.${decimalPart}`;
        }
        
        return formattedInteger;
    };

    // Función para convertir formato con comas a número
    const parseFormattedNumber = (formattedValue: string): number => {
        const cleanValue = formattedValue.replace(/,/g, '');
        return parseFloat(cleanValue) || 0;
    };

    // Manejar cambio en precio de venta
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNumber(e.target.value);
        setFormattedPrice(formatted);
        const numericValue = parseFormattedNumber(formatted);
        setFormData(prev => ({ ...prev, price: numericValue }));
    };

    // Manejar cambio en precio de renta
    const handleRentPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNumber(e.target.value);
        setFormattedRentPrice(formatted);
        const numericValue = parseFormattedNumber(formatted);
        setFormData(prev => ({ ...prev, rentPrice: numericValue }));
    };

    const handleGenerateDescription = async () => {
        if (!formData.type || !formData.city || !formData.state) {
            alert("Por favor, completa al menos el tipo de propiedad, estado y ciudad antes de generar la descripción.");
            return;
        }
        setIsGenerating(true);
        try {
            const description = await generatePropertyDescription({
                type: formData.type,
                city: formData.city,
                state: formData.state,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                amenities: formData.amenities,
            });
            setFormData(prev => ({...prev, description }));
        } catch (error) {
            console.error("Error generating description", error);
        } finally {
            setIsGenerating(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Preparar datos para envío, convirtiendo coordenadas de texto a número
            const submitData = { ...formData };
            
            // Convertir coordenadas de texto a número y redondear
            if (submitData.latitude) {
                const latValue = typeof submitData.latitude === 'string' ? parseFloat(submitData.latitude) : submitData.latitude;
                if (!isNaN(latValue)) {
                    submitData.latitude = Math.round(latValue * 1000000) / 1000000;
                }
            }
            
            if (submitData.longitude) {
                const lngValue = typeof submitData.longitude === 'string' ? parseFloat(submitData.longitude) : submitData.longitude;
                if (!isNaN(lngValue)) {
                    submitData.longitude = Math.round(lngValue * 1000000) / 1000000;
                }
            }
            
            // Validar coordenadas antes de enviar
            if (submitData.latitude && submitData.longitude) {
                if (submitData.latitude < -90 || submitData.latitude > 90) {
                    alert('La latitud debe estar entre -90 y 90 grados');
                    setIsLoading(false);
                    return;
                }
                if (submitData.longitude < -180 || submitData.longitude > 180) {
                    alert('La longitud debe estar entre -180 y 180 grados');
                    setIsLoading(false);
                    return;
                }
            }
            
            // Las imágenes ya están comprimidas como data URLs en imagePreviews
            const images = imagePreviews;

            const locationString = `${submitData.city}, ${submitData.state}`;

            const newProperty: Omit<Property, 'id'> = {
                ...(submitData as any), // Cast to any to handle optional number fields
                location: locationString,
                images,
                videos: videoUrls, // URLs de YouTube
                video360: video360Urls, // URLs del recorrido 360
                mainPhotoIndex: mainPhotoIndex
            };
            
            addProperty(newProperty);
            onPropertyAdded();

        } catch (error) {
            console.error("Error creating property:", error);
            alert("Hubo un error al crear la propiedad. Por favor, inténtelo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <section className="py-16 md:py-24 bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl space-y-8">
                    <h2 className="text-3xl font-extrabold text-inverland-dark text-center">Registrar Nuevo Inmueble</h2>
                    
                    <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                        <legend className="text-xl font-bold px-2 text-inverland-dark">Información Básica</legend>
                        <InputField label="Tipo de propiedad" name="type" required onChange={handleInputChange}>
                           <select name="type" id="type" required value={formData.type} onChange={handleInputChange} className="mt-1 block w-full input-style">
                               {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                        </InputField>
                        <InputField label="Título del anuncio" name="title" required value={formData.title} onChange={handleInputChange} />
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción del anuncio<span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating}
                                    className="flex items-center text-xs font-semibold text-inverland-blue hover:text-inverland-dark transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-inverland-blue mr-2"></div>
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-4 h-4 mr-1" />
                                            Generar con IA
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea name="description" id="description" required value={formData.description} rows={5} onChange={handleInputChange} className="mt-1 block w-full input-style" placeholder="Describe la propiedad o genera una descripción con IA..."></textarea>
                            <p className="text-xs text-gray-500 mt-1">Para una descripción más precisa, completa los campos de tipo, ubicación, recámaras, baños y amenidades.</p>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                        <legend className="text-xl font-bold px-2 text-inverland-dark">Operación y Precio</legend>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Operación<span className="text-red-500">*</span></label>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                <label className="flex items-center"><input type="radio" name="operationType" value="Venta" checked={formData.operationType === 'Venta'} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">Venta</span></label>
                                <label className="flex items-center"><input type="radio" name="operationType" value="Renta" checked={formData.operationType === 'Renta'} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">Renta</span></label>
                                <label className="flex items-center"><input type="radio" name="operationType" value="Renta temporal" checked={formData.operationType === 'Renta temporal'} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">Renta temporal</span></label>
                            </div>
                        </div>
                        {formData.operationType === 'Venta' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio de Venta (MXN) *</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formattedPrice}
                                    onChange={handlePriceChange}
                                    required
                                    placeholder="Ej: 1,500,000.00"
                                    className="mt-1 block w-full input-style"
                                />
                            </div>
                        )}
                        {formData.operationType?.includes('Renta') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio de Renta (MXN) *</label>
                                <input
                                    type="text"
                                    name="rentPrice"
                                    value={formattedRentPrice}
                                    onChange={handleRentPriceChange}
                                    required
                                    placeholder="Ej: 15,000.00"
                                    className="mt-1 block w-full input-style"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mostrar precios en el anuncio</label>
                            <div className="mt-2 flex space-x-4">
                                <label className="flex items-center"><input type="radio" name="showPrice" value="true" checked={formData.showPrice === true} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">Sí</span></label>
                                <label className="flex items-center"><input type="radio" name="showPrice" value="false" checked={formData.showPrice === false} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">No</span></label>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                        <legend className="text-xl font-bold px-2 text-inverland-dark">Características</legend>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {/* Campos para CASAS */}
                            {formData.type === 'Casa' && (
                                <>
                                    <InputField label="Recámaras" name="bedrooms" type="number" placeholder="No indicado" value={formData.bedrooms} onChange={handleInputChange} />
                                    <InputField label="Baños" name="bathrooms" type="number" placeholder="No indicado" value={formData.bathrooms} onChange={handleInputChange}/>
                                    <InputField label="Medios baños" name="halfBathrooms" type="number" placeholder="No indicado" value={formData.halfBathrooms} onChange={handleInputChange}/>
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Terreno (m²)" name="landArea" type="number" value={formData.landArea} onChange={handleInputChange} />
                                    <InputField label="Fondo (m)" name="landDepth" type="number" value={formData.landDepth} onChange={handleInputChange} />
                                    <InputField label="Frente (m)" name="landFront" type="number" value={formData.landFront} onChange={handleInputChange} />
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                </>
                            )}

                            {/* Campos para DEPARTAMENTOS */}
                            {formData.type === 'Departamento' && (
                                <>
                                    <InputField label="Recámaras" name="bedrooms" type="number" placeholder="No indicado" value={formData.bedrooms} onChange={handleInputChange} />
                                    <InputField label="Baños" name="bathrooms" type="number" placeholder="No indicado" value={formData.bathrooms} onChange={handleInputChange}/>
                                    <InputField label="Medios baños" name="halfBathrooms" type="number" placeholder="No indicado" value={formData.halfBathrooms} onChange={handleInputChange}/>
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Piso" name="floorNumber" type="number" placeholder="No indicado" value={formData.floorNumber} onChange={handleInputChange}/>
                                    <InputField label="Pisos edif." name="buildingFloors" type="number" placeholder="No indicado" value={formData.buildingFloors} onChange={handleInputChange}/>
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                    <InputField label="Mantenim." name="maintenanceFee" type="number" value={formData.maintenanceFee} onChange={handleInputChange} />
                                </>
                            )}

                            {/* Campos para TERRENOS */}
                            {formData.type === 'Terreno' && (
                                <>
                                    <InputField label="Terreno (m²)" name="landArea" type="number" value={formData.landArea} onChange={handleInputChange} />
                                    <InputField label="Fondo (m)" name="landDepth" type="number" value={formData.landDepth} onChange={handleInputChange} />
                                    <InputField label="Frente (m)" name="landFront" type="number" value={formData.landFront} onChange={handleInputChange} />
                                </>
                            )}

                            {/* Campos para OFICINAS */}
                            {formData.type === 'Oficina' && (
                                <>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Piso" name="floorNumber" type="number" placeholder="No indicado" value={formData.floorNumber} onChange={handleInputChange}/>
                                    <InputField label="Pisos edif." name="buildingFloors" type="number" placeholder="No indicado" value={formData.buildingFloors} onChange={handleInputChange}/>
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                    <InputField label="Mantenim." name="maintenanceFee" type="number" value={formData.maintenanceFee} onChange={handleInputChange} />
                                </>
                            )}

                            {/* Campos para LOCALES COMERCIALES */}
                            {formData.type === 'Local Comercial' && (
                                <>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Piso" name="floorNumber" type="number" placeholder="No indicado" value={formData.floorNumber} onChange={handleInputChange}/>
                                    <InputField label="Pisos edif." name="buildingFloors" type="number" placeholder="No indicado" value={formData.buildingFloors} onChange={handleInputChange}/>
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                    <InputField label="Mantenim." name="maintenanceFee" type="number" value={formData.maintenanceFee} onChange={handleInputChange} />
                                </>
                            )}

                            {/* Campos para BODEGAS INDUSTRIALES */}
                            {formData.type === 'Bodega Industrial' && (
                                <>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Terreno (m²)" name="landArea" type="number" value={formData.landArea} onChange={handleInputChange} />
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                </>
                            )}

                            {/* Campos para LOFTS */}
                            {formData.type === 'Loft' && (
                                <>
                                    <InputField label="Recámaras" name="bedrooms" type="number" placeholder="No indicado" value={formData.bedrooms} onChange={handleInputChange} />
                                    <InputField label="Baños" name="bathrooms" type="number" placeholder="No indicado" value={formData.bathrooms} onChange={handleInputChange}/>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Piso" name="floorNumber" type="number" placeholder="No indicado" value={formData.floorNumber} onChange={handleInputChange}/>
                                    <InputField label="Pisos edif." name="buildingFloors" type="number" placeholder="No indicado" value={formData.buildingFloors} onChange={handleInputChange}/>
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                    <InputField label="Mantenim." name="maintenanceFee" type="number" value={formData.maintenanceFee} onChange={handleInputChange} />
                                </>
                            )}

                            {/* Campos para VILLAS */}
                            {formData.type === 'Villa' && (
                                <>
                                    <InputField label="Recámaras" name="bedrooms" type="number" placeholder="No indicado" value={formData.bedrooms} onChange={handleInputChange} />
                                    <InputField label="Baños" name="bathrooms" type="number" placeholder="No indicado" value={formData.bathrooms} onChange={handleInputChange}/>
                                    <InputField label="Medios baños" name="halfBathrooms" type="number" placeholder="No indicado" value={formData.halfBathrooms} onChange={handleInputChange}/>
                                    <InputField label="Estacionamientos" name="parkingSpaces" type="number" placeholder="No indicado" value={formData.parkingSpaces} onChange={handleInputChange}/>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Terreno (m²)" name="landArea" type="number" value={formData.landArea} onChange={handleInputChange} />
                                    <InputField label="Fondo (m)" name="landDepth" type="number" value={formData.landDepth} onChange={handleInputChange} />
                                    <InputField label="Frente (m)" name="landFront" type="number" value={formData.landFront} onChange={handleInputChange} />
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                </>
                            )}

                            {/* Campos para HACIENDAS */}
                            {formData.type === 'Hacienda' && (
                                <>
                                    <InputField label="Recámaras" name="bedrooms" type="number" placeholder="No indicado" value={formData.bedrooms} onChange={handleInputChange} />
                                    <InputField label="Baños" name="bathrooms" type="number" placeholder="No indicado" value={formData.bathrooms} onChange={handleInputChange}/>
                                    <InputField label="Construcción (m²)" name="constructionArea" type="number" value={formData.constructionArea} onChange={handleInputChange} />
                                    <InputField label="Terreno (m²)" name="landArea" type="number" value={formData.landArea} onChange={handleInputChange} />
                                    <InputField label="Fondo (m)" name="landDepth" type="number" value={formData.landDepth} onChange={handleInputChange} />
                                    <InputField label="Frente (m)" name="landFront" type="number" value={formData.landFront} onChange={handleInputChange} />
                                    <InputField label="Año const." name="constructionYear" type="number" placeholder="No indicado" value={formData.constructionYear} onChange={handleInputChange}/>
                                </>
                            )}
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <InputField label="Clave interna" name="internalKey" placeholder="Ej. DPTO123" value={formData.internalKey} onChange={handleInputChange} />
                            <InputField label="Código de la llave" name="keyLockerCode" placeholder="Ej. C123" value={formData.keyLockerCode} onChange={handleInputChange}/>
                         </div>
                    </fieldset>
                    
                    <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                        <legend className="text-xl font-bold px-2 text-inverland-dark">Ubicación</legend>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                             <InputField label="País" name="country" value="México" onChange={() => {}} />
                             <InputField label="Estado" name="state" required value={formData.state} onChange={handleInputChange} />
                             <InputField label="Ciudad" name="city" required value={formData.city} onChange={handleInputChange} />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              <InputField label="Colonia" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} />
                              <InputField label="Código Postal" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <InputField label="Calle" name="street" required value={formData.street} onChange={handleInputChange} />
                            <InputField label="Número" name="streetNumber" value={formData.streetNumber} onChange={handleInputChange} />
                            <InputField label="Interior" name="interiorNumber" value={formData.interiorNumber} onChange={handleInputChange} />
                            <InputField label="Esquina con" name="crossStreet" value={formData.crossStreet} onChange={handleInputChange} />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700">Latitud</label>
                                 <input
                                     type="text"
                                     name="latitude"
                                     value={formData.latitude ?? ''}
                                     onChange={handleInputChange}
                                     onPaste={handleCoordinatePaste}
                                     placeholder="Ej: 21.1098"
                                     className="mt-1 block w-full input-style"
                                 />
                                 <p className="text-xs text-gray-500 mt-1">Coordenada norte-sur (-90 a 90)</p>
                                 {formData.latitude && (() => {
                                     const lat = typeof formData.latitude === 'string' ? parseFloat(formData.latitude) : formData.latitude;
                                     return !isNaN(lat) && (lat < -90 || lat > 90);
                                 })() && (
                                     <p className="text-xs text-red-500 mt-1">⚠️ Latitud fuera de rango válido</p>
                                 )}
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700">Longitud</label>
                                 <input
                                     type="text"
                                     name="longitude"
                                     value={formData.longitude ?? ''}
                                     onChange={handleInputChange}
                                     onPaste={handleCoordinatePaste}
                                     placeholder="Ej: -101.6878"
                                     className="mt-1 block w-full input-style"
                                 />
                                 <p className="text-xs text-gray-500 mt-1">Coordenada este-oeste (-180 a 180)</p>
                                 {formData.longitude && (() => {
                                     const lng = typeof formData.longitude === 'string' ? parseFloat(formData.longitude) : formData.longitude;
                                     return !isNaN(lng) && (lng < -180 || lng > 180);
                                 })() && (
                                     <p className="text-xs text-red-500 mt-1">⚠️ Longitud fuera de rango válido</p>
                                 )}
                             </div>
                         </div>
                         <div className="bg-blue-50 p-4 rounded-lg">
                             <h4 className="font-semibold text-blue-800 mb-2">📍 ¿Cómo obtener coordenadas?</h4>
                             <p className="text-sm text-blue-700 mb-2">Puedes obtener las coordenadas exactas de varias formas:</p>
                             <ul className="text-sm text-blue-600 space-y-1">
                                 <li>• <strong>Google Maps:</strong> Click derecho en la ubicación → "¿Qué hay aquí?"</li>
                                 <li>• <strong>Maps.app:</strong> Mantén presionado en la ubicación</li>
                                 <li>• <strong>Coordenadas comunes:</strong></li>
                                 <li className="ml-4">- León, Gto: Lat 21.1098, Lng -101.6878</li>
                                 <li className="ml-4">- Mérida, Yuc: Lat 20.9674, Lng -89.5926</li>
                                 <li className="ml-4">- CDMX: Lat 19.4326, Lng -99.1332</li>
                             </ul>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Mostrar ubicación exacta</label>
                             <div className="mt-2 flex space-x-4">
                                <label className="flex items-center"><input type="radio" name="showExactLocation" value="true" checked={formData.showExactLocation === true} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">Sí</span></label>
                                <label className="flex items-center"><input type="radio" name="showExactLocation" value="false" checked={formData.showExactLocation === false} onChange={handleRadioChange} className="radio-style"/> <span className="ml-2">No</span></label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Si eliges no mostrar la ubicación exacta, algunas apps y portales podrían no publicar el anuncio.</p>
                        </div>
                    </fieldset>
                    
                    <fieldset className="p-4 md:p-6 border rounded-lg">
                        <legend className="text-xl font-bold px-2 text-inverland-dark">Amenidades</legend>
                        <div className="space-y-6 mt-4">
                            {Object.entries(AMENITIES_LIST).map(([category, amenities]) => (
                                <div key={category}>
                                    <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">{category}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {category === 'Políticas' ? (
                                            // Para políticas, usar radio buttons para evitar conflictos
                                            <>
                                                <div className="col-span-full">
                                                    <h5 className="font-medium text-gray-700 mb-2">Mascotas:</h5>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="pets" 
                                                                value="Mascotas permitidas"
                                                                checked={formData.amenities.includes('Mascotas permitidas')}
                                                                onChange={() => handlePolicyToggle('Mascotas permitidas', 'No se aceptan mascotas')}
                                                                className="h-4 w-4 text-inverland-green border-gray-300 focus:ring-inverland-green"
                                                            />
                                                            <span className="text-gray-700 text-sm">Mascotas permitidas</span>
                                                        </label>
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="pets" 
                                                                value="No se aceptan mascotas"
                                                                checked={formData.amenities.includes('No se aceptan mascotas')}
                                                                onChange={() => handlePolicyToggle('No se aceptan mascotas', 'Mascotas permitidas')}
                                                                className="h-4 w-4 text-inverland-green border-gray-300 focus:ring-inverland-green"
                                                            />
                                                            <span className="text-gray-700 text-sm">No se aceptan mascotas</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-span-full">
                                                    <h5 className="font-medium text-gray-700 mb-2">Fumar:</h5>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="smoking" 
                                                                value="Permitido fumar"
                                                                checked={formData.amenities.includes('Permitido fumar')}
                                                                onChange={() => handlePolicyToggle('Permitido fumar', 'Prohibido fumar')}
                                                                className="h-4 w-4 text-inverland-green border-gray-300 focus:ring-inverland-green"
                                                            />
                                                            <span className="text-gray-700 text-sm">Permitido fumar</span>
                                                        </label>
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="smoking" 
                                                                value="Prohibido fumar"
                                                                checked={formData.amenities.includes('Prohibido fumar')}
                                                                onChange={() => handlePolicyToggle('Prohibido fumar', 'Permitido fumar')}
                                                                className="h-4 w-4 text-inverland-green border-gray-300 focus:ring-inverland-green"
                                                            />
                                                            <span className="text-gray-700 text-sm">Prohibido fumar</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            // Para otras categorías, usar checkboxes normales
                                            amenities.map(amenity => (
                                                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="h-4 w-4 text-inverland-green rounded border-gray-300 focus:ring-inverland-green"/>
                                                    <span className="text-gray-700 text-sm">{amenity}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    
                    <fieldset className="space-y-6 p-4 md:p-6 border rounded-lg">
                        <legend className="text-xl font-bold px-2 text-inverland-dark">Multimedia</legend>
                        <div>
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                Imágenes 
                                <span className="text-sm text-gray-500 ml-2">
                                    ({imagePreviews.length}/10 fotos)
                                </span>
                            </label>
                            <input 
                                type="file" 
                                name="images" 
                                id="images" 
                                multiple 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                disabled={imageFiles.length >= 10}
                                className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-inverland-blue/10 file:text-inverland-blue hover:file:bg-inverland-blue/20 ${imageFiles.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {imageFiles.length >= 10 && (
                                <p className="mt-2 text-sm text-amber-600">
                                    ✅ Máximo de 10 fotos alcanzado. Elimina alguna foto para agregar más.
                                </p>
                            )}
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={src} 
                                            alt={`Preview ${index}`} 
                                            className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                                                index === mainPhotoIndex 
                                                    ? 'ring-4 ring-inverland-blue ring-opacity-75 shadow-lg' 
                                                    : 'hover:shadow-md'
                                            }`}
                                            onClick={() => setMainPhoto(index)}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index)} 
                                            className="absolute top-0 right-0 m-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            &times;
                                        </button>
                                        {index === mainPhotoIndex && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-inverland-blue text-white text-xs text-center py-1 rounded-b-lg">
                                                Foto Principal
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {imagePreviews.length > 0 && (
                                <p className="mt-2 text-sm text-gray-600">
                                    💡 Haz clic en cualquier foto para establecerla como foto principal
                                </p>
                            )}
                        </div>
                        
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
                        
                        {/* Recorridos Virtuales 360 */}
                        <hr className="my-4 border-gray-200" />
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
                    
                    <style>{`
                        .input-style { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } 
                        .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }
                        .radio-style { color: #083d5c; focus:ring-inverland-green; }
                    `}</style>
                    
                    <div className="text-right">
                        <button type="submit" disabled={isLoading} className="bg-inverland-green text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-transform duration-300 transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:scale-100">
                           {isLoading ? 'Guardando...' : 'Guardar Inmueble'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default AddProperty;