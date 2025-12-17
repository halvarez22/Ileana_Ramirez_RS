import React, { useState, useEffect } from 'react';
import { Campaign, Client } from '../types';
import { useCampaigns } from './CampaignContext';
import { generateCampaignBody } from '../services/geminiService';

// Using a simple textarea instead of ReactQuill to avoid React 19 compatibility issues

interface CampaignFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignToEdit: Campaign | null;
}

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const AIGenerationModal: React.FC<{ onGenerate: (prompt: string) => void, onClose: () => void, isGenerating: boolean }> = ({ onGenerate, onClose, isGenerating }) => {
    const [prompt, setPrompt] = useState('');
    
    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };
    
    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-2xl border w-full max-w-md mx-4">
                <h4 className="text-lg font-bold text-inverland-dark">Generar Contenido con IA</h4>
                <p className="text-sm text-gray-600 mt-1 mb-4">Describe brevemente el objetivo de tu campaña.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej: Anunciar nuevas propiedades de lujo en Cancún..."
                    rows={3}
                    className="w-full input-style"
                    disabled={isGenerating}
                />
                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={onClose} type="button" className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors" disabled={isGenerating}>Cancelar</button>
                    <button onClick={handleGenerateClick} type="button" className="px-4 py-2 bg-inverland-blue text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 flex items-center" disabled={isGenerating || !prompt.trim()}>
                        {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                        Generar
                    </button>
                </div>
            </div>
        </div>
    );
};


const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ isOpen, onClose, campaignToEdit }) => {
    const { addCampaign, updateCampaign } = useCampaigns();
    
    const initialFormState: Omit<Campaign, 'id' | 'status' | 'sentToCount' | 'sentAt'> = {
        name: '',
        subject: '',
        body: '',
        targetAudience: {
            status: [],
            leadSource: [],
        },
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<{ name?: string, subject?: string }>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIPrompt, setShowAIPrompt] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            if (campaignToEdit) {
                setFormData({
                    name: campaignToEdit.name,
                    subject: campaignToEdit.subject,
                    body: campaignToEdit.body,
                    targetAudience: campaignToEdit.targetAudience,
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({});
        }
    }, [campaignToEdit, isOpen]);

    if (!isOpen) return null;

    const validate = (): boolean => {
        const newErrors: { name?: string, subject?: string } = {};
        if (!formData.name.trim()) newErrors.name = "El nombre de la campaña es obligatorio.";
        if (!formData.subject.trim()) newErrors.subject = "El asunto del email es obligatorio.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    
    const handleGenerateBody = async (prompt: string) => {
        setIsGenerating(true);
        try {
            const content = await generateCampaignBody(prompt);
            setFormData(prev => ({ ...prev, body: content }));
        } catch (error) {
            console.error("Error generating campaign content", error);
            // Optionally show an error to the user
        } finally {
            setIsGenerating(false);
            setShowAIPrompt(false);
        }
    };

    const handleStatusToggle = (status: Client['status']) => {
        setFormData(prev => {
            const current = prev.targetAudience.status;
            const updated = current.includes(status) ? current.filter(s => s !== status) : [...current, status];
            return { ...prev, targetAudience: { ...prev.targetAudience, status: updated } };
        });
    };
    
    const handleSourceToggle = (source: NonNullable<Client['leadSource']>) => {
        setFormData(prev => {
            const current = prev.targetAudience.leadSource;
            const updated = current.includes(source) ? current.filter(s => s !== source) : [...current, source];
            return { ...prev, targetAudience: { ...prev.targetAudience, leadSource: updated } };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        if (campaignToEdit) {
            updateCampaign({ ...campaignToEdit, ...formData });
        } else {
            addCampaign(formData);
        }
        onClose();
    };
    
    const clientStatuses: Client['status'][] = ['Lead', 'Contactado', 'Activo', 'En espera', 'Descartado'];
    const leadSources: NonNullable<Client['leadSource']>[] = ['Web', 'Referido', 'Llamada', 'Otro'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 id="modal-title" className="text-2xl font-bold text-inverland-dark">
                        {campaignToEdit ? 'Editar Campaña' : 'Crear Nueva Campaña'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Campaña (uso interno)</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className={`mt-1 block w-full input-style ${errors.name ? '!border-red-500' : ''}`} />
                         {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto del Email</label>
                        <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleInputChange} required className={`mt-1 block w-full input-style ${errors.subject ? '!border-red-500' : ''}`} />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                    </div>
                     <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Cuerpo del Email</label>
                            <button
                                type="button"
                                onClick={() => setShowAIPrompt(true)}
                                className="flex items-center text-xs font-semibold text-inverland-blue hover:text-inverland-dark transition-colors"
                            >
                                <SparklesIcon className="w-4 h-4 mr-1" />
                                Generar con IA
                            </button>
                        </div>
                        <div className="mt-1">
                            <textarea
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Escribe el contenido de tu email aquí... Puedes usar {{client_name}} para personalizar el saludo."
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-inverland-blue focus:border-transparent resize-vertical"
                            />
                        </div>
                        {showAIPrompt && <AIGenerationModal onGenerate={handleGenerateBody} onClose={() => setShowAIPrompt(false)} isGenerating={isGenerating} />}
                    </div>

                    <fieldset className="p-4 border rounded-lg">
                        <legend className="text-lg font-bold px-2 text-inverland-dark">Público Objetivo</legend>
                        <p className="text-sm text-gray-500 mb-4 px-2">Selecciona los criterios para segmentar tu audiencia. Si no seleccionas ninguno en una categoría, se incluirán todos.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Por Estatus</h4>
                                <div className="space-y-2">
                                    {clientStatuses.map(status => (
                                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.targetAudience.status.includes(status)} onChange={() => handleStatusToggle(status)} className="h-4 w-4 text-inverland-green rounded border-gray-300 focus:ring-inverland-green"/>
                                            <span className="text-gray-700 text-sm">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Por Fuente de Lead</h4>
                                <div className="space-y-2">
                                    {leadSources.map(source => (
                                        <label key={source} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.targetAudience.leadSource.includes(source)} onChange={() => handleSourceToggle(source)} className="h-4 w-4 text-inverland-green rounded border-gray-300 focus:ring-inverland-green"/>
                                            <span className="text-gray-700 text-sm">{source}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    
                    <div className="p-5 pt-0 -mx-6 -mb-6 mt-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-lg">
                        <button onClick={onClose} type="button" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-inverland-green text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                            {campaignToEdit ? 'Guardar Cambios' : 'Crear Campaña'}
                        </button>
                    </div>
                </form>
                 <style>{`
                        .input-style { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } 
                        .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }
                    `}</style>
            </div>
        </div>
    );
};

export default CampaignFormModal;