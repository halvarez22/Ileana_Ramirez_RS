import React, { useState, useEffect, useMemo } from 'react';
import { Client } from '../types';
import { useClients } from './ClientContext';
import { useAuth } from './AuthContext';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientToEdit: Client | null;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, clientToEdit }) => {
    const { addClient, updateClient } = useClients();
    const { users } = useAuth();
    
    const initialFormState: Omit<Client, 'id'> = {
        name: '',
        email: '',
        phone: '',
        status: 'Lead',
        leadSource: 'Web',
        assignedAgentId: '',
        notes: '',
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<{ name?: string, email?: string }>({});

    const agents = useMemo(() => users.filter(u => u.role === 'agent' || u.role === 'admin'), [users]);

    useEffect(() => {
        if (isOpen) {
            if (clientToEdit) {
                setFormData({
                    name: clientToEdit.name,
                    email: clientToEdit.email,
                    phone: clientToEdit.phone || '',
                    status: clientToEdit.status,
                    leadSource: clientToEdit.leadSource || 'Web',
                    assignedAgentId: clientToEdit.assignedAgentId || '',
                    notes: clientToEdit.notes || '',
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({}); // Clear errors when modal opens/changes
        }
    }, [clientToEdit, isOpen]);

    if (!isOpen) return null;
    
    const validate = (): boolean => {
        const newErrors: { name?: string, email?: string } = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
        if (!formData.email.trim()) {
            newErrors.email = "El email es obligatorio.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "El formato del email no es válido.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        if (clientToEdit) {
            updateClient({ ...clientToEdit, ...formData });
        } else {
            addClient(formData);
        }
        onClose();
    };
    
    const clientStatuses: Client['status'][] = ['Lead', 'Contactado', 'Activo', 'En espera', 'Descartado'];
    const leadSources: NonNullable<Client['leadSource']>[] = ['Web', 'Referido', 'Llamada', 'Otro'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 id="modal-title" className="text-2xl font-bold text-inverland-dark">
                        {clientToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className={`mt-1 block w-full input-style ${errors.name ? '!border-red-500' : ''}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className={`mt-1 block w-full input-style ${errors.email ? '!border-red-500' : ''}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estatus</label>
                            <select name="status" id="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full input-style">
                                {clientStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700">Fuente</label>
                             <select name="leadSource" id="leadSource" value={formData.leadSource} onChange={handleInputChange} className="mt-1 block w-full input-style">
                                 {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="assignedAgentId" className="block text-sm font-medium text-gray-700">Agente Asignado</label>
                        <select name="assignedAgentId" id="assignedAgentId" value={formData.assignedAgentId} onChange={handleInputChange} className="mt-1 block w-full input-style">
                            <option value="">Sin asignar</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name || agent.username}</option>
                            ))}
                        </select>
                    </div>
                    
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
                        <textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="mt-1 block w-full input-style" placeholder="Añadir notas sobre el cliente..."></textarea>
                    </div>

                    <div className="p-5 pt-0 -mx-6 -mb-6 mt-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-lg">
                        <button onClick={onClose} type="button" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-inverland-green text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                            {clientToEdit ? 'Guardar Cambios' : 'Añadir Cliente'}
                        </button>
                    </div>
                </form>
                 <style>{`
                        .input-style { 
                            background-color: white; 
                            color: #1F2937; 
                            border-radius: 0.375rem; 
                            border-width: 1px; 
                            border-color: #D1D5DB; 
                            padding: 0.5rem 0.75rem; 
                            width: 100%; 
                            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                        } 
                        .input-style:focus { 
                            outline: 2px solid transparent; 
                            outline-offset: 2px; 
                            --tw-ring-color: #083d5c; 
                            box-shadow: 0 0 0 2px var(--tw-ring-color); 
                            border-color: #083d5c; 
                        }
                    `}</style>
            </div>
        </div>
    );
};

export default ClientFormModal;