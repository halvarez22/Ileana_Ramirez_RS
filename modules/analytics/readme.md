# Módulo 3: Analítica y Reportes - Documentación Técnica

## 1. Propósito del Módulo

El Módulo de Analítica y Reportes está diseñado para transformar los datos operativos de la plataforma en información visual y accionable. Su objetivo es proporcionar a los administradores una visión clara del rendimiento del negocio, la efectividad de los agentes y el comportamiento de los clientes a través de dashboards interactivos.

Funcionalidades clave:
-   Visualización de Indicadores Clave de Rendimiento (KPIs).
-   Generación de gráficos sobre la distribución y origen de clientes.
-   Creación de tablas y rankings para medir el rendimiento de los agentes.
-   Filtrado de todos los datos por rango de fechas para análisis de períodos específicos.

## 2. Componentes Clave

### 2.1. Modelo de Datos (`types.ts`)

Para soportar el filtrado temporal, el modelo de datos ha sido enriquecido:
-   **`Client`**: Se añadió la propiedad `createdAt: string;` para registrar el momento en que un cliente es añadido al sistema.
-   **`Property`**: Se añadió la propiedad opcional `soldAt?: string;` que se registra cuando el estatus de una propiedad cambia a `Sold`.

### 2.2. Librerías Externas

-   **Chart.js**: Se ha integrado esta librería a través de CDN para la renderización de todos los gráficos del módulo. Se optó por utilizar la librería directamente sobre un canvas de HTML, gestionado a través de componentes de React, para mantener la ligereza y evitar dependencias complejas de wrappers en el entorno actual.

### 2.3. Componentes de UI

-   **`AnalyticsPage.tsx`**: Es la página principal del módulo y actúa como el dashboard central. Se encarga de:
    -   Gestionar el estado de los filtros de rango de fechas (`startDate`, `endDate`).
    -   Obtener los datos de los contextos `PropertyContext`, `ClientContext` y `AuthContext`.
    -   Utilizar `useMemo` para recalcular dinámicamente las métricas cada vez que el rango de fechas cambia, filtrando clientes por `createdAt` y propiedades vendidas por `soldAt`.
    -   Pasar los datos filtrados a los componentes de visualización (KPIs, gráficos, tablas), asegurando que todo el dashboard se actualice de forma reactiva.

-   **Componentes de Gráficos (`components/charts/`)**: Para encapsular la lógica de Chart.js y promover la reutilización, se han creado componentes específicos:
    -   **`ClientStatusDoughnutChart.tsx`**: Recibe una lista de clientes y renderiza un gráfico de dona mostrando la proporción de cada estatus.
    -   **`LeadSourceBarChart.tsx`**: Recibe una lista de clientes y renderiza un gráfico de barras mostrando el número de clientes por cada fuente de origen.

-   **`UserPortal.tsx`**: Se ha modificado para incluir una nueva tarjeta y un nuevo ícono (`AnalyticsIcon`) que sirve como punto de entrada al `AnalyticsPage`.

-   **`App.tsx`**: Se ha actualizado para incluir la nueva ruta `/analytics` y su correspondiente vista, protegida para que solo los administradores puedan acceder.

## 3. Estado Actual de la Implementación

**Tarea 3.1: UI - Dashboard de Analítica (Completada)**
-   Se integró `Chart.js` y se crearon los componentes base del dashboard con métricas agregadas.

**Tarea 3.2: UI - Filtros Avanzados y Gráficos Dinámicos (Completada)**
-   Se han añadido campos de entrada de fecha (`date input`) en `AnalyticsPage.tsx` para definir un rango de análisis.
-   La lógica de cálculo de datos dentro del componente ahora filtra los registros de clientes y propiedades basándose en los `timestamps` y el rango de fechas seleccionado.
-   Todos los elementos del dashboard (KPIs, gráficos, tablas) son ahora completamente dinámicos y se actualizan al aplicar los filtros.
-   Se ha añadido la funcionalidad de limpiar los filtros para volver a la vista de datos históricos completos.

El módulo ahora cuenta con un dashboard funcional, dinámico y visualmente informativo, proporcionando una herramienta robusta para el análisis de negocio.