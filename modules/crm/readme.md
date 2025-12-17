# Módulo 1: Gestión de Clientes (CRM) - Documentación Técnica

## 1. Propósito del Módulo

El Módulo de Gestión de Clientes (CRM) es el corazón de la plataforma para la administración de las relaciones con clientes potenciales y existentes. Su objetivo es centralizar toda la información y las interacciones para optimizar el proceso de ventas y mejorar el servicio al cliente.

Este módulo permitirá a los agentes y administradores:
-   Registrar y gestionar una base de datos de clientes.
-   Rastrear el historial de comunicaciones y actividades.
-   Vincular clientes a propiedades de interés.
-   Gestionar el pipeline de ventas desde el primer contacto hasta el cierre.

## 2. Componentes Clave

### 2.1. Modelo de Datos (`types.ts`)

La base del módulo es la definición de la estructura de datos para un cliente. Se ha introducido una nueva interfaz: `Client`.

```typescript
export interface Client {
    id: string;              // Identificador único
    name: string;            // Nombre completo del cliente
    email: string;           // Correo electrónico
    phone?: string;          // Teléfono de contacto
    status: 'Lead' | 'Contactado' | 'Activo' | 'En espera' | 'Descartado'; // Estatus actual del cliente
    leadSource?: 'Web' | 'Referido' | 'Llamada' | 'Otro'; // Origen del cliente
    assignedAgentId?: string; // ID del agente asignado
    notes?: string;          // Notas generales sobre el cliente
}
```

Además, se han realizado modificaciones en otras interfaces para permitir la vinculación:
-   **`Property`**: Se añadió el campo `clientId?: string | null;` para asociar un cliente a una propiedad específica.
-   **`ActivityLog`**: Se añadió el campo `notes?: string;` para registrar detalles específicos de cada actividad.

### 2.2. Gestión de Estado (`ClientContext.tsx`, `PropertyContext.tsx`)

-   **`ClientContext`**: Gestiona el estado global de los clientes (añadir, editar, eliminar) y persiste los datos en `localStorage`.
-   **`PropertyContext`**: Se ha añadido la función `assignClientToProperty(propertyId: string, clientId: string | null)` para manejar la lógica de negocio de vincular o desvincular un cliente de una propiedad.

### 2.3. Componentes de UI

-   `ClientsPage.tsx`: Página principal para la gestión de la base de datos de clientes.
-   `ClientFormModal.tsx`: Modal para crear y editar la información de los clientes.
-   `ClientAssignmentModal.tsx`: Un nuevo modal que permite seleccionar un cliente de una lista y asignarlo a una propiedad específica.

## 3. Estado Actual de la Implementación

**Tarea 1.1 - 1.4 (Completadas)**
-   Se ha definido el modelo de datos.
-   Se ha implementado la gestión de estado para clientes.
-   Se ha construido la interfaz de usuario para listar, crear, editar y eliminar clientes.

**Tarea 1.5: Vinculación Propiedad-Cliente (Completada)**
-   Se ha creado el componente `components/ClientAssignmentModal.tsx`, que permite buscar y seleccionar un cliente.
-   En `TrackingPage.tsx`, la vista de "Pipeline de Ventas" ahora muestra el cliente asignado a cada propiedad.
-   Los usuarios pueden hacer clic en el nombre del cliente (o en "Asignar Cliente") para abrir el modal y gestionar la vinculación.
-   Se ha añadido la lógica correspondiente en `PropertyContext` para persistir esta vinculación.

Con esta tarea, el Módulo 1 (CRM) está funcionalmente completo.