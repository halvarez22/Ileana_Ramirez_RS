import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Property, Client, Campaign, User } from '../types';

// Collections
const PROPERTIES_COLLECTION = 'properties';
const CLIENTS_COLLECTION = 'clients';
const CAMPAIGNS_COLLECTION = 'campaigns';
const USERS_COLLECTION = 'users';

// Helper function to delete user directly (avoid circular reference)
const deleteUserDirectly = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Helper function to get all users directly (avoid circular reference)
const getAllUsersDirectly = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const allUsers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    
    // Eliminar duplicados por ID (por si Firebase devuelve duplicados)
    const uniqueUsers = new Map<string, User>();
    for (const user of allUsers) {
      if (!uniqueUsers.has(user.id)) {
        uniqueUsers.set(user.id, user);
      }
    }
    
    const result = Array.from(uniqueUsers.values());
    
    if (result.length !== allUsers.length) {
      console.warn(`🔧 Firebase devolvió ${allUsers.length} usuarios, pero solo ${result.length} son únicos`);
    }
    
    return result;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Helper function to add user directly (avoid circular reference)
const addUserDirectly = async (user: Omit<User, 'id'>): Promise<string> => {
  try {
    const cleanUser = Object.fromEntries(
      Object.entries(user).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...cleanUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Property Service
export const propertyService = {
  // Get all properties
  async getAllProperties(): Promise<Property[]> {
    try {
      const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  },

  // Get property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Property;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  },

  // Add new property
  async addProperty(property: Omit<Property, 'id'>): Promise<string> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanProperty = Object.fromEntries(
        Object.entries(property).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), {
        ...cleanProperty,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  },

  // Update property
  async updateProperty(id: string, property: Partial<Property>): Promise<void> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanProperty = Object.fromEntries(
        Object.entries(property).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      await updateDoc(docRef, {
        ...cleanProperty,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Delete property
  async deleteProperty(id: string): Promise<void> {
    try {
      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }
};

// Client Service
export const clientService = {
  // Get all clients
  async getAllClients(): Promise<Client[]> {
    try {
      const q = query(collection(db, CLIENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  },

  // Get client by ID
  async getClientById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Client;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  },

  // Add new client
  async addClient(client: Omit<Client, 'id'>): Promise<string> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanClient = Object.fromEntries(
        Object.entries(client).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
        ...cleanClient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  // Update client
  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanClient = Object.fromEntries(
        Object.entries(client).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...cleanClient,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};

// Campaign Service
export const campaignService = {
  // Get all campaigns
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  },

  // Get campaign by ID
  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Campaign;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  },

  // Add new campaign
  async addCampaign(campaign: Omit<Campaign, 'id'>): Promise<string> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanCampaign = Object.fromEntries(
        Object.entries(campaign).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
        ...cleanCampaign,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding campaign:', error);
      throw error;
    }
  },

  // Update campaign
  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<void> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanCampaign = Object.fromEntries(
        Object.entries(campaign).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
      await updateDoc(docRef, {
        ...cleanCampaign,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }
};

// User Service
export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const allUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      // Eliminar duplicados por ID (por si Firebase devuelve duplicados)
      const uniqueUsers = new Map<string, User>();
      for (const user of allUsers) {
        if (!uniqueUsers.has(user.id)) {
          uniqueUsers.set(user.id, user);
        }
      }
      
      const result = Array.from(uniqueUsers.values());
      
      if (result.length !== allUsers.length) {
        console.warn(`🔧 Firebase devolvió ${allUsers.length} usuarios, pero solo ${result.length} son únicos`);
      }
      
      return result;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Add new user
  async addUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanUser = Object.fromEntries(
        Object.entries(user).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
        ...cleanUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: string, user: Partial<User>): Promise<void> {
    try {
      // Limpiar valores undefined antes de enviar a Firebase
      const cleanUser = Object.fromEntries(
        Object.entries(user).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = doc(db, USERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...cleanUser,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Check if user exists by username
  async userExistsByUsername(username: string): Promise<boolean> {
    try {
      const q = query(collection(db, USERS_COLLECTION));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.some(doc => doc.data().username === username);
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  },

  // Sync users between Firebase and localStorage (avoid duplicates)
  async syncUsers(): Promise<User[]> {
    try {
      console.log('🔄 Iniciando sincronización de usuarios...');
      
      // Primero limpiar duplicados en Firebase
      const duplicatesRemoved = await userService.cleanDuplicateUsers();
      if (duplicatesRemoved > 0) {
        console.log(`🧹 ${duplicatesRemoved} duplicados eliminados de Firebase`);
      }
      
      // Obtener usuarios de Firebase (ya limpios)
      const firebaseUsers = await getAllUsersDirectly();
      
      // Obtener usuarios de localStorage
      let localUsers: User[] = [];
      try {
        const storedUsers = localStorage.getItem('ileana_users');
        if (storedUsers) {
          localUsers = JSON.parse(storedUsers);
        }
      } catch (error) {
        console.warn('Error reading from localStorage:', error);
      }

      // Crear mapa de usuarios de Firebase por username para verificación rápida
      const firebaseUsersMap = new Map(firebaseUsers.map(user => [user.username, user]));
      
      // Filtrar usuarios locales que no existen en Firebase
      const newLocalUsers = localUsers.filter(localUser => 
        !firebaseUsersMap.has(localUser.username)
      );

      // Agregar usuarios locales nuevos a Firebase
      const syncedUsers = [...firebaseUsers];
      for (const localUser of newLocalUsers) {
        try {
          const userId = await addUserDirectly(localUser);
          syncedUsers.push({ ...localUser, id: userId });
          console.log(`✅ Usuario sincronizado: ${localUser.username}`);
        } catch (error) {
          console.warn(`❌ Error sincronizando usuario ${localUser.username}:`, error);
        }
      }

      // Actualizar localStorage con la lista sincronizada
      try {
        localStorage.setItem('ileana_users', JSON.stringify(syncedUsers));
      } catch (error) {
        console.warn('Error updating localStorage:', error);
      }

      console.log(`✅ Sincronización completada: ${syncedUsers.length} usuarios únicos`);
      return syncedUsers;
    } catch (error) {
      console.error('Error syncing users:', error);
      throw error;
    }
  },

  // Clean duplicate users (keep the first occurrence)
  async cleanDuplicateUsers(): Promise<number> {
    try {
      const allUsers = await getAllUsersDirectly();
      const uniqueUsers = new Map<string, User>();
      let duplicatesRemoved = 0;

      // Mantener solo la primera ocurrencia de cada username
      for (const user of allUsers) {
        if (!uniqueUsers.has(user.username)) {
          uniqueUsers.set(user.username, user);
        } else {
          // Eliminar duplicado (mantener el primero, eliminar este)
          try {
            await deleteUserDirectly(user.id);
            duplicatesRemoved++;
            console.log(`🗑️ Usuario duplicado eliminado: ${user.username} (ID: ${user.id})`);
          } catch (error) {
            console.warn(`❌ Error eliminando duplicado ${user.username}:`, error);
          }
        }
      }

      // Actualizar localStorage con usuarios únicos
      const cleanedUsers = Array.from(uniqueUsers.values());
      try {
        localStorage.setItem('ileana_users', JSON.stringify(cleanedUsers));
      } catch (error) {
        console.warn('Error updating localStorage after cleanup:', error);
      }

      console.log(`🧹 Limpieza completada: ${duplicatesRemoved} duplicados eliminados`);
      return duplicatesRemoved;
    } catch (error) {
      console.error('Error cleaning duplicate users:', error);
      throw error;
    }
  },

  // Diagnostic function to see all users
  async diagnoseUsers(): Promise<void> {
    try {
      const allUsers = await getAllUsersDirectly();
      console.log('🔍 DIAGNÓSTICO DE USUARIOS:');
      console.log(`📊 Total de usuarios: ${allUsers.length}`);
      
      // Crear un Set para identificar IDs únicos
      const uniqueIds = new Set<string>();
      const duplicateIds: string[] = [];
      
      // Verificar IDs duplicados
      for (const user of allUsers) {
        if (uniqueIds.has(user.id)) {
          duplicateIds.push(user.id);
        } else {
          uniqueIds.add(user.id);
        }
      }
      
      if (duplicateIds.length > 0) {
        console.log(`🚨 PROBLEMA: IDs duplicados encontrados: ${duplicateIds.join(', ')}`);
        console.log('🔧 Esto indica un problema en la consulta a Firebase');
      }
      
      const usersByUsername = new Map<string, User[]>();
      
      // Agrupar por username
      for (const user of allUsers) {
        if (!usersByUsername.has(user.username)) {
          usersByUsername.set(user.username, []);
        }
        usersByUsername.get(user.username)!.push(user);
      }
      
      // Mostrar duplicados
      for (const [username, users] of usersByUsername) {
        if (users.length > 1) {
          console.log(`🔴 DUPLICADO: ${username} (${users.length} copias)`);
          users.forEach((user, index) => {
            console.log(`   ${index + 1}. ID: ${user.id}, Name: ${user.name}, Role: ${user.role}`);
          });
        } else {
          console.log(`✅ ÚNICO: ${username} (ID: ${users[0].id})`);
        }
      }
    } catch (error) {
      console.error('Error in diagnose users:', error);
    }
  },

  // Force clean all duplicates (manual cleanup)
  async forceCleanDuplicates(): Promise<{ removed: number, users: User[] }> {
    try {
      console.log('🧹 Iniciando limpieza forzada de duplicados...');
      
      const allUsers = await getAllUsersDirectly();
      console.log(`📊 Total de usuarios encontrados: ${allUsers.length}`);
      
      // Crear un Map para mantener solo la primera ocurrencia de cada ID único
      const uniqueUsers = new Map<string, User>();
      const duplicatesToRemove: User[] = [];

      // Identificar duplicados por ID (no por username)
      for (const user of allUsers) {
        if (!uniqueUsers.has(user.id)) {
          uniqueUsers.set(user.id, user);
        } else {
          duplicatesToRemove.push(user);
          console.log(`🔍 Usuario con ID duplicado encontrado: ${user.username} (ID: ${user.id})`);
        }
      }

      console.log(`🔍 Duplicados por ID encontrados: ${duplicatesToRemove.length}`);
      
      // Si hay duplicados por ID, esto indica un problema en la consulta
      if (duplicatesToRemove.length > 0) {
        console.log('🚨 PROBLEMA: Hay usuarios con IDs duplicados. Esto no debería pasar en Firebase.');
        console.log('🔧 Solución: Filtrar duplicados por ID único');
        
        // Obtener lista final limpia (solo IDs únicos)
        const cleanedUsers = Array.from(uniqueUsers.values());
        
        // Actualizar localStorage
        try {
          localStorage.setItem('ileana_users', JSON.stringify(cleanedUsers));
          console.log('💾 localStorage actualizado');
        } catch (error) {
          console.warn('Error updating localStorage:', error);
        }

        console.log(`✅ Limpieza completada: ${duplicatesToRemove.length} duplicados por ID eliminados`);
        console.log(`📊 Usuarios únicos restantes: ${cleanedUsers.length}`);
        
        return {
          removed: duplicatesToRemove.length,
          users: cleanedUsers
        };
      }

      // Si no hay duplicados por ID, proceder con limpieza por username
      const usersByUsername = new Map<string, User>();
      const usernameDuplicates: User[] = [];

      // Identificar duplicados por username
      for (const user of allUsers) {
        if (!usersByUsername.has(user.username)) {
          usersByUsername.set(user.username, user);
        } else {
          usernameDuplicates.push(user);
        }
      }

      console.log(`🔍 Duplicados por username encontrados: ${usernameDuplicates.length}`);
      
      // Eliminar duplicados por username
      for (const duplicate of usernameDuplicates) {
        try {
          await deleteUserDirectly(duplicate.id);
          console.log(`🗑️ Eliminado: ${duplicate.username} (ID: ${duplicate.id})`);
        } catch (error) {
          console.warn(`❌ Error eliminando ${duplicate.username}:`, error);
        }
      }

      // Obtener lista final limpia
      const cleanedUsers = await getAllUsersDirectly();
      
      // Actualizar localStorage
      try {
        localStorage.setItem('ileana_users', JSON.stringify(cleanedUsers));
        console.log('💾 localStorage actualizado');
      } catch (error) {
        console.warn('Error updating localStorage:', error);
      }

      console.log(`✅ Limpieza forzada completada: ${usernameDuplicates.length} duplicados eliminados`);
      console.log(`📊 Usuarios únicos restantes: ${cleanedUsers.length}`);
      
      return {
        removed: usernameDuplicates.length,
        users: cleanedUsers
      };
    } catch (error) {
      console.error('Error in force clean duplicates:', error);
      throw error;
    }
  },
};
