# Módulo 2: Marketing y Comunicación - Documentación Técnica

## 1. Propósito del Módulo

El Módulo de Marketing y Comunicación está diseñado para proporcionar herramientas que permitan a los administradores crear, segmentar y enviar comunicaciones por correo electrónico a la base de datos de clientes. El objetivo es nutrir leads, anunciar nuevas propiedades y mantener el contacto con los clientes de manera eficiente y escalable.

Funcionalidades clave:
-   Creación y edición de plantillas de campañas de email.
-   Segmentación de la audiencia basada en los atributos del cliente (ej. estatus, fuente del lead).
-   Simulación de envío de campañas y registro de la actividad en el perfil de cada cliente.

## 2. Componentes Clave

### 2.1. Modelo de Datos (`types.ts`)

Se han introducido las siguientes interfaces para dar soporte al módulo:

```typescript
export interface ClientActivityLog {
    id: string;
    timestamp: string;
    activity: string; // Ej: "Email de campaña recibido"
    details?: string; // Ej: "Campaña: 'Nuevas Propiedades en Polanco'"
}

export interface Campaign {
    id: string;
    name: string; // Nombre interno de la campaña
    subject: string; // Asunto del email
    body: string; // Contenido del email, puede contener HTML
    targetAudience: { // Criterios para la segmentación
        status: Client['status'][];
        leadSource: NonNullable<Client['leadSource']>[];
    };
    status: 'Borrador' | 'Enviada';
    sentAt?: string; // Fecha de envío
    sentToCount: number; // Número de clientes a los que se envió
}
```

Además, la interfaz `Client` ha sido actualizada para incluir un `activityLog` (`ClientActivityLog[]`), permitiendo registrar cada interacción con el cliente.

### 2.2. Gestión de Estado (`CampaignContext.tsx`, `ClientContext.tsx`)

-   **`CampaignContext.tsx`**: Un nuevo proveedor de contexto para manejar el estado global de las campañas. Carga datos desde `localStorage` y expone funciones para `addCampaign`, `updateCampaign`, `deleteCampaign`, y `sendCampaign`. La función `sendCampaign` es una simulación que identifica a los clientes objetivo, actualiza el estado de la campaña y devuelve la lista de clientes para que la UI pueda registrar la actividad.
-   **`ClientContext.tsx`**: Se ha añadido la función `addActivityToClient` para permitir que otros módulos (como el de marketing) registren interacciones en el historial de un cliente.

### 2.3. Componentes de UI

-   **`MarketingPage.tsx`**: La página principal del módulo. Muestra una lista tabular de todas las campañas, permitiendo la búsqueda y el filtrado. Contiene los botones para disparar las acciones de crear, editar, eliminar y enviar campañas. Orquesta la comunicación entre el `CampaignContext` y el `ClientContext` al momento de enviar una campaña.
-   **`CampaignFormModal.tsx`**: Un componente modal que contiene el formulario para crear y editar campañas. Incluye campos para el nombre, asunto, y una sección de segmentación con checkboxes para definir el público objetivo. Ahora incorpora un editor de texto enriquecido.

## 3. Estado Actual de la Implementación

**Tarea 2.1: Modelo de Datos y Estado para Campañas (Completada)**
-   Se han definido y añadido a `types.ts` los modelos de datos para `Campaign` y `ClientActivityLog`.
-   Se ha implementado el `CampaignContext` para la gestión completa del estado de las campañas.
-   Se ha actualizado el `ClientContext` para soportar el registro de actividades.
-   La aplicación ha sido actualizada para incluir el nuevo `CampaignProvider`.

**Tarea 2.2: UI - Página de Gestión de Campañas (Completada)**
-   Se ha creado el componente `components/MarketingPage.tsx` como el punto de entrada al módulo.
-   Se ha implementado `components/CampaignFormModal.tsx` para la gestión de datos de las campañas.
-   Se ha añadido la lógica para el envío de campañas, que actualiza el estatus de la campaña y registra la actividad en los perfiles de los clientes correspondientes.
-   Se ha integrado la nueva página en la navegación principal a través del `UserPortal`.

**Tarea 2.3: UI - Editor de Contenido de Campañas (Completada)**
-   Se ha integrado la librería de editor de texto enriquecido `React-Quill` mediante CDN.
-   En `CampaignFormModal.tsx`, el `<textarea>` para el cuerpo del email ha sido reemplazado por el componente `ReactQuill`.
-   Se ha configurado una barra de herramientas con opciones de formato esenciales (títulos, negritas, listas, enlaces).
-   El contenido del editor se guarda como una cadena de HTML en el campo `body` de la campaña.

Con esta tarea, el Módulo 2 (Marketing y Comunicación) está funcionalmente completo.