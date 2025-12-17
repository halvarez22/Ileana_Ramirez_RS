import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit: User;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, userToEdit }) => {
    const { updateUser } = useAuth();
    
    const [formData, setFormData] = useState({
        name: userToEdit.name || '',
        username: userToEdit.username,
        commissionRate: (userToEdit.commissionRate || 0) * 100,
    });
    
    const [errors, setErrors] = useState<{ name?: string, username?: string }>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: userToEdit.name || '',
                username: userToEdit.username,
                commissionRate: (userToEdit.commissionRate || 0) * 100,
            });
            setErrors({});
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;
    
    const validate = (): boolean => {
        const newErrors: { name?: string, username?: string } = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
        if (!formData.username.trim()) newErrors.username = "El nombre de usuario es obligatorio.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value 
        }));
         if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const updatedUserData: User = {
            ...userToEdit,
            name: formData.name,
            username: formData.username,
            commissionRate: userToEdit.role === 'agent' ? formData.commissionRate / 100 : undefined,
        };

        await updateUser(updatedUserData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 id="modal-title" className="text-2xl font-bold text-inverland-dark">
                        Editar Usuario: <span className="text-inverland-green">{userToEdit.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                        <input type="text" name="name" id="edit-name" value={formData.name} onChange={handleInputChange} required className={`mt-1 block w-full input-style ${errors.name ? '!border-red-500' : ''}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700">Usuario (username)</label>
                        <input type="text" name="username" id="edit-username" value={formData.username} onChange={handleInputChange} required className={`mt-1 block w-full input-style ${errors.username ? '!border-red-500' : ''}`} />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>
                    {userToEdit.role === 'agent' && (
                        <div>
                            <label htmlFor="edit-commissionRate" className="block text-sm font-medium text-gray-700">Tasa de Comisión (%)</label>
                            <input type="number" name="commissionRate" id="edit-commissionRate" value={formData.commissionRate} onChange={handleInputChange} step="0.1" min="0" className="mt-1 block w-full input-style" />
                        </div>
                    )}

                    <div className="p-5 pt-0 -mx-6 -mb-6 mt-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-lg">
                        <button onClick={onClose} type="button" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-inverland-green text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
                 <style>{`
                        .input-style { 
                            background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                        } 
                        .input-style:focus { 
                            outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; 
                        }
                    `}</style>
            </div>
        </div>
    );
};

export default UserEditModal;