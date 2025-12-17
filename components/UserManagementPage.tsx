import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { User } from '../types';
import UserEditModal from './UserEditModal';
import { useProperties } from './PropertyContext';
import { useClients } from './ClientContext';

const UserManagementPage: React.FC = () => {
    const { users, registerUser, deleteUser, forceCleanDuplicates, diagnoseUsers, statusMessage, clearStatusMessage } = useAuth();
    const { properties } = useProperties();
    const { clients } = useClients();
    
    const initialFormState = {
        username: '',
        password: '',
        name: '',
        commissionRate: 0,
        role: 'agent' as 'admin' | 'user' | 'agent' | 'referrer'
    };
    const [formData, setFormData] = useState(initialFormState);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        // Clear message on component unmount
        return () => {
            clearStatusMessage();
        };
    }, [clearStatusMessage]);

     useEffect(() => {
        // Auto-clear message after a few seconds
        if (statusMessage) {
            const timer = setTimeout(() => {
                clearStatusMessage();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage, clearStatusMessage]);

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingUser(null);
        setIsEditModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        clearStatusMessage();
        if (!formData.username || !formData.password || !formData.name) {
             // Basic validation, context will handle if user exists
            return;
        }
        
        const newUser: Omit<User, 'id'> = {
            username: formData.username,
            password: formData.password,
            name: formData.name,
            role: formData.role,
            commissionRate: formData.role === 'agent' ? formData.commissionRate / 100 : undefined,
        };

        await registerUser(newUser);
        setFormData(initialFormState); // Reset form optimistically
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
            await deleteUser(userId, userName, properties, clients);
        }
    };

    const handleCleanDuplicates = async () => {
        if (window.confirm('¿Estás seguro de que deseas limpiar todos los usuarios duplicados? Esta acción eliminará los duplicados manteniendo solo la primera ocurrencia de cada usuario.')) {
            await forceCleanDuplicates();
        }
    };

    const handleDiagnoseUsers = async () => {
        await diagnoseUsers();
    };

    return (
        <>
            <section className="py-16 md:py-24 bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-inverland-dark mb-12 text-center">Gestión de Usuarios</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                        {/* Registration Form */}
                        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-lg shadow-xl self-start">
                            <h3 className="text-2xl font-bold text-inverland-dark mb-6">Crear Nuevo Usuario</h3>
                            <form onSubmit={handleRegister} className="space-y-4">
                                {statusMessage && (
                                    <p className={`px-4 py-3 rounded relative text-sm ${statusMessage.startsWith('Éxito') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`} role="alert">
                                        {statusMessage}
                                    </p>
                                )}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full input-style"/>
                                </div>
                                <div>
                                    <label htmlFor="new-username" className="block text-sm font-medium text-gray-700">Usuario (username)</label>
                                    <input type="text" id="new-username" name="username" value={formData.username} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                                    <input type="password" id="new-password" name="password" value={formData.password} onChange={handleInputChange} required className="mt-1 block w-full input-style"/>
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
                                    <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="mt-1 block w-full input-style">
                                        <option value="agent">Agente</option>
                                        <option value="referrer">Referidor</option>
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                {formData.role === 'agent' && (
                                     <div>
                                        <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">Tasa de Comisión (%)</label>
                                        <input type="number" id="commissionRate" name="commissionRate" value={formData.commissionRate} onChange={handleInputChange} step="0.1" min="0" className="mt-1 block w-full input-style" placeholder="Ej: 2.5"/>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-inverland-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inverland-blue transition-transform transform hover:scale-105">
                                        Registrar Usuario
                                    </button>
                                </div>
                            </form>
                            
                            {/* Clean Duplicates Button */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="space-y-3">
                                    <button 
                                        onClick={handleDiagnoseUsers}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        🔍 Diagnosticar Usuarios
                                    </button>
                                    <button 
                                        onClick={handleCleanDuplicates}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        🧹 Limpiar Usuarios Duplicados
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Primero diagnostica, luego limpia duplicados
                                </p>
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-lg shadow-xl">
                            <h3 className="text-2xl font-bold text-inverland-dark mb-6">Usuarios Existentes</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                    <button onClick={() => handleOpenEditModal(user)} className="text-inverland-blue hover:text-inverland-dark">Editar</button>
                                                    <button onClick={() => handleDelete(user.id, user.username)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {isEditModalOpen && editingUser && (
                <UserEditModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    userToEdit={editingUser}
                />
            )}
            <style>{`.input-style { background-color: white; color: #1F2937; border-radius: 0.375rem; border-width: 1px; border-color: #D1D5DB; padding: 0.5rem 0.75rem; width: 100%; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #083d5c; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #083d5c; }`}</style>
        </>
    );
};

export default UserManagementPage;