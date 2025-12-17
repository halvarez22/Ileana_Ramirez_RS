import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Property, Client } from '../types';
import { userService } from '../services/firebaseService';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    users: User[];
    statusMessage: string | null;
    clearStatusMessage: () => void;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    registerUser: (newUser: Omit<User, 'id'>) => Promise<void>;
    updateUser: (updatedUser: User) => Promise<void>;
    deleteUser: (userId: string, currentUserName: string, properties: Property[], clients: Client[]) => Promise<void>;
    forceCleanDuplicates: () => Promise<void>;
    diagnoseUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    
    useEffect(() => {
        const loadUsers = async () => {
            try {
                console.log('🔄 Iniciando carga de usuarios...');
                
                // Usar función de sincronización inteligente
                const syncedUsers = await userService.syncUsers();
                
                if (syncedUsers.length > 0) {
                    setUsers(syncedUsers);
                    console.log(`✅ Usuarios cargados: ${syncedUsers.length}`);
                } else {
                    // Si no hay usuarios después de la sincronización (probablemente por error de Firebase)
                    const isDevelopment = window.location.hostname === 'localhost';

                    if (isDevelopment) {
                        console.log('🔧 Desarrollo: Usando usuarios locales (sin Firebase)...');
                        // En desarrollo, usar usuarios locales directamente sin Firebase
                        const localUsers = [
                            { id: 'admin1', username: 'admin', password: 'admin', role: 'admin' as const, name: 'Administrador' },
                            { id: 'agent1', username: 'jhernandez', password: 'password', role: 'agent' as const, name: 'Juan Hernández', commissionRate: 0.025 },
                            { id: 'agent2', username: 'agente', password: 'agente', role: 'agent' as const, name: 'Agente de Pruebas', commissionRate: 0.03 },
                            { id: 'referrer1', username: 'referido', password: 'password', role: 'referrer' as const, name: 'Ana de Referidos' }
                        ];

                        console.log('✅ Usuarios locales cargados:', localUsers.length);
                        setUsers(localUsers);

                        // Guardar en localStorage
                        try {
                            localStorage.setItem('ileana_users', JSON.stringify(localUsers));
                        } catch (localError) {
                            console.warn("Failed to save to localStorage:", localError);
                        }
                    } else {
                        // En producción, empezar con lista vacía
                        console.log('🌐 Producción: Lista de usuarios vacía');
                        setUsers([]);
                    }
                }
            } catch (error) {
                console.error('❌ Error en carga de usuarios:', error);

                const isDevelopment = window.location.hostname === 'localhost';
                if (isDevelopment) {
                    console.log('🔧 Desarrollo: Error de Firebase, usando usuarios locales...');
                    // En desarrollo, usar usuarios locales si Firebase falla
                    const localUsers = [
                        { id: 'admin1', username: 'admin', password: 'admin', role: 'admin' as const, name: 'Administrador' },
                        { id: 'agent1', username: 'jhernandez', password: 'password', role: 'agent' as const, name: 'Juan Hernández', commissionRate: 0.025 },
                        { id: 'agent2', username: 'agente', password: 'agente', role: 'agent' as const, name: 'Agente de Pruebas', commissionRate: 0.03 },
                        { id: 'referrer1', username: 'referido', password: 'password', role: 'referrer' as const, name: 'Ana de Referidos' }
                    ];

                    setUsers(localUsers);
                    console.log('✅ Usuarios locales cargados tras error de Firebase:', localUsers.length);

                    // Guardar en localStorage
                    try {
                        localStorage.setItem('ileana_users', JSON.stringify(localUsers));
                    } catch (localError) {
                        console.warn("Failed to save to localStorage:", localError);
                    }
                } else {
                    // En producción, fallback a localStorage
                    try {
                        const storedUsers = localStorage.getItem('ileana_users');
                        if (storedUsers) {
                            const localUsers = JSON.parse(storedUsers);
                            setUsers(localUsers);
                            console.log(`📱 Fallback a localStorage: ${localUsers.length} usuarios`);
                        } else {
                            setUsers([]);
                            console.log('📱 Sin usuarios en localStorage');
                        }
                    } catch (localError) {
                        console.error("❌ Error accediendo a localStorage:", localError);
                        setUsers([]);
                    }
                }
            }
        };
        
        loadUsers();
        
        // Cargar sesión actual
        try {
            const sessionUser = sessionStorage.getItem('inverland_session');
            if (sessionUser) {
                setCurrentUser(JSON.parse(sessionUser));
            }
        } catch (error) {
            console.error("Failed to access session storage:", error);
        }
    }, []);

    const clearStatusMessage = () => {
        setStatusMessage(null);
    };

    const login = (username: string, password: string): boolean => {
        console.log('🔐 Intentando login para:', username);
        console.log('🔐 Usuarios disponibles:', users.map(u => ({ username: u.username, hasPassword: !!u.password })));
        
        const user = users.find(u => u.username === username && u.password === password);
        console.log('🔐 Usuario encontrado:', user ? 'SÍ' : 'NO');
        
        if (user) {
            const userToStore = { ...user };
            delete userToStore.password;
            setCurrentUser(userToStore);
            try {
              sessionStorage.setItem('inverland_session', JSON.stringify(userToStore));
              console.log('🔐 Login exitoso para:', username);
            } catch(error) {
              console.error("Failed to set session storage:", error);
            }
            return true;
        }
        console.log('🔐 Login fallido para:', username);
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        try {
          sessionStorage.removeItem('inverland_session');
        } catch(error) {
          console.error("Failed to remove from session storage:", error)
        }
    };

    const registerUser = async (newUser: Omit<User, 'id'>) => {
        console.log('👤 Registrando nuevo usuario:', newUser.username);
        
        // Verificar duplicados localmente
        if (users.some(u => u.username === newUser.username)) {
            setStatusMessage(`Error: El usuario '${newUser.username}' ya existe.`);
            return;
        }

        try {
            // Verificar duplicados en Firebase
            const existsInFirebase = await userService.userExistsByUsername(newUser.username);
            if (existsInFirebase) {
                setStatusMessage(`Error: El usuario '${newUser.username}' ya existe en el sistema.`);
                return;
            }

            // Agregar a Firebase
            const userId = await userService.addUser(newUser);
            const userWithId: User = { ...newUser, id: userId };
            
            // Actualizar estado local
            setUsers(currentUsers => {
                const updatedUsers = [...currentUsers, userWithId];
                console.log('👤 Usuario creado con ID:', userWithId.id);
                console.log('👤 Total de usuarios:', updatedUsers.length);
                
                // También guardar en localStorage como backup
                try {
                    localStorage.setItem('ileana_users', JSON.stringify(updatedUsers));
                    console.log('👤 Usuario guardado en localStorage');
                } catch (localError) {
                    console.warn("Failed to save to localStorage backup:", localError);
                }
                
                return updatedUsers;
            });
            
            setStatusMessage(`Éxito: Usuario '${newUser.username}' creado.`);
        } catch (error) {
            console.error("Failed to create user in Firebase:", error);
            setStatusMessage("Error: No se pudo crear el usuario.");
        }
    };
    
    const updateUser = async (updatedUser: User) => {
        try {
            // Actualizar en Firebase primero
            await userService.updateUser(updatedUser.id, updatedUser);
            
            // Actualizar estado local
            setUsers(currentUsers => {
                const updatedUsers = currentUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
                
                // También guardar en localStorage como backup
                try {
                    localStorage.setItem('ileana_users', JSON.stringify(updatedUsers));
                } catch (localError) {
                    console.warn("Failed to save to localStorage backup:", localError);
                }
                
                return updatedUsers;
            });
            
            setStatusMessage(`Éxito: Usuario '${updatedUser.username}' actualizado.`);

            // Actualizar sesión actual si es el usuario logueado
            if (currentUser && currentUser.id === updatedUser.id) {
                const userToStore = { ...currentUser, ...updatedUser };
                delete userToStore.password;
                setCurrentUser(userToStore);
                try {
                    sessionStorage.setItem('inverland_session', JSON.stringify(userToStore));
                } catch (error) {
                    console.error("Failed to update session storage:", error);
                }
            }
        } catch (error) {
            console.error("Failed to update user in Firebase:", error);
            setStatusMessage("Error: No se pudo actualizar el usuario.");
        }
    };

    const deleteUser = async (userId: string, currentUserName: string, properties: Property[], clients: Client[]) => {
        if (userId === currentUser?.id) {
            setStatusMessage("Error: No puedes eliminar al usuario con el que has iniciado sesión.");
            return;
        }
        
        const userToDelete = users.find(u => u.id === userId);
        if (currentUser?.role === 'admin' && userToDelete?.role === 'admin') {
            setStatusMessage("Error: Un administrador no puede eliminar a otro. Primero degrada su rol.");
            return;
        }

        const hasAssignedProperties = properties.some(p => p.agentId === userId);
        const hasAssignedClients = clients.some(c => c.assignedAgentId === userId);

        if (hasAssignedProperties || hasAssignedClients) {
            setStatusMessage(`Error: No se puede eliminar a '${currentUserName}'. Reasigna sus propiedades y clientes primero.`);
            return;
        }
        
        try {
            // Eliminar de Firebase primero
            await userService.deleteUser(userId);
            
            // Actualizar estado local
            setUsers(currentUsers => {
                const updatedUsers = currentUsers.filter(u => u.id !== userId);
                
                // También guardar en localStorage como backup
                try {
                    localStorage.setItem('ileana_users', JSON.stringify(updatedUsers));
                } catch (localError) {
                    console.warn("Failed to save to localStorage backup:", localError);
                }
                
                return updatedUsers;
            });
            
            setStatusMessage(`Éxito: Usuario '${currentUserName}' eliminado.`);
        } catch (error) {
            console.error("Failed to delete user in Firebase:", error);
            setStatusMessage("Error: No se pudo eliminar el usuario.");
        }
    };

    const forceCleanDuplicates = async () => {
        try {
            console.log('🧹 Iniciando limpieza manual de duplicados...');
            const result = await userService.forceCleanDuplicates();
            
            // Actualizar el estado local con la lista limpia
            setUsers(result.users);
            
            setStatusMessage(`✅ Limpieza completada: ${result.removed} duplicados eliminados. ${result.users.length} usuarios únicos restantes.`);
            
            console.log(`✅ Limpieza manual completada: ${result.removed} duplicados eliminados`);
        } catch (error) {
            console.error('❌ Error en limpieza manual:', error);
            setStatusMessage('❌ Error durante la limpieza de duplicados.');
        }
    };

    const diagnoseUsers = async () => {
        try {
            await userService.diagnoseUsers();
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
        }
    };
    
    const isAuthenticated = !!currentUser;

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, users, login, logout, registerUser, updateUser, deleteUser, forceCleanDuplicates, diagnoseUsers, statusMessage, clearStatusMessage }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};