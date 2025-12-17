# Módulo 5: Portal de Agente - Documentación Técnica

## 1. Propósito del Módulo

El Portal de Agente es un dashboard dedicado y personalizado, diseñado para que los agentes inmobiliarios puedan gestionar eficientemente su cartera de propiedades y clientes. Su objetivo es proporcionar una vista centralizada de sus responsabilidades y métricas de rendimiento, separando su espacio de trabajo del portal de administración general.

Funcionalidades clave:
-   Ofrecer un resumen visual del rendimiento del agente a través de KPIs (Indicadores Clave de Rendimiento).
-   Listar de forma clara todas las propiedades asignadas al agente.
-   Mostrar todos los clientes que están bajo la gestión del agente.
-   Servir como punto de entrada para futuras funcionalidades específicas del rol de agente.

## 2. Componentes Clave

### 2.1. Lógica de Enrutamiento (`App.tsx`)

El componente principal `App.tsx` ha sido modificado para implementar una lógica de enrutamiento basada en roles.
-   Cuando un usuario navega a la vista `userPortal`, el sistema ahora verifica el `currentUser.role`.
-   Si el rol es `admin`, renderiza el `UserPortal` (el portal de gestión).
-   Si el rol es `agent`, renderiza el nuevo componente `AgentPortal.tsx`.
-   Para cualquier otro rol (ej. `user`), muestra una vista genérica de "próximamente".
-   Esta separación a nivel de enrutador principal asegura que los componentes del portal (`UserPortal`, `AgentPortal`) sean más simples y se adhieran al principio de responsabilidad única.

### 2.2. Componente Principal (`AgentPortal.tsx`)

Este es un componente nuevo que constituye la totalidad del dashboard del agente.
-   **Obtención de Datos**: Utiliza los hooks `useAuth`, `useProperties` y `useClients` para acceder al estado global de la aplicación.
-   **Filtrado de Datos**: Emplea `useMemo` para filtrar eficientemente las propiedades y clientes que pertenecen específicamente al agente que ha iniciado sesión (`currentUser.id`). Esto asegura que el portal solo muestre datos relevantes para el usuario actual.
-   **Cálculo de KPIs**: Dentro de un `useMemo`, calcula en tiempo real las métricas clave del agente: total de propiedades asignadas, clientes activos, propiedades vendidas y el valor total de esas ventas.
-   **UI y Estado Local**:
    -   Utiliza un estado local (`useState`) para gestionar la pestaña activa (`Mis Propiedades` o `Mis Clientes`).
    -   Renderiza una serie de `KpiCard` para mostrar las métricas de rendimiento.
    -   Muestra el contenido de la pestaña activa, ya sea una cuadrícula de tarjetas de propiedades o una tabla de clientes.
    -   El diseño es consistente con la estética general de la plataforma.

### 2.3. Simplificación del `UserPortal.tsx`

Como resultado de la nueva lógica de enrutamiento en `App.tsx`, el componente `UserPortal.tsx` ha sido refactorizado.
-   Se ha eliminado la lógica condicional que mostraba un mensaje diferente para usuarios no administradores.
-   Ahora, el componente asume que siempre será renderizado para un administrador, lo que simplifica su código y elimina la necesidad de pasar props como `disabled={!isAdmin}` a los componentes `ManagementCard`.

## 3. Estado Actual de la Implementación

**Tarea 5.1: Creación del Portal de Agente (Completada)**
-   Se ha implementado el componente `AgentPortal.tsx` con todas las funcionalidades descritas.
-   Se ha actualizado `App.tsx` para enrutar a los agentes a su nuevo portal.
-   Se ha refactorizado `UserPortal.tsx` para ser un componente exclusivo de administración.

El módulo ahora proporciona una experiencia de usuario significativamente mejorada para los agentes, dándoles las herramientas que necesitan para tener éxito y separando claramente sus funciones de las del administrador.