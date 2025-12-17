# Módulo 4: Herramientas con IA - Documentación Técnica

## 1. Propósito del Módulo

El Módulo de Herramientas con IA tiene como objetivo integrar funcionalidades inteligentes en la plataforma para aumentar la eficiencia, mejorar la calidad del contenido y automatizar tareas repetitivas. Este módulo servirá como un contenedor para diversas herramientas que aprovechan la capacidad de los modelos generativos de Google para asistir a los administradores y agentes en sus tareas diarias.

---

## 2. Implementaciones

### Tarea 4.1: IA - Generador de Descripciones de Propiedades (Completada)

#### **`geminiService.ts`**
Este servicio fue extendido para incluir una función que interactúa con la API de Gemini para la generación de texto creativo.

-   **`generatePropertyDescription(propertyDetails: object): Promise<string>`**:
    -   **Entrada**: Recibe un objeto con las características clave de una propiedad (tipo, ubicación, recámaras, baños, amenidades).
    -   **Proceso**: Construye un *prompt* específico y detallado, instruyendo al modelo `gemini-2.5-flash` para que actúe como un redactor inmobiliario experto. El prompt está diseñado para generar una descripción de marketing en español, con un tono profesional y vendedor, y con una longitud controlada.
    -   **Salida**: Devuelve la descripción de la propiedad en formato de texto plano (`string`).
    -   **Manejo de Errores**: Incluye un bloque `try...catch` para manejar posibles fallos en la comunicación con la API y devolver un mensaje de error amigable.

#### **`AddProperty.tsx`**
El formulario de alta de inmuebles ha sido modificado para integrar la nueva funcionalidad de IA.

-   **Nuevos Elementos de UI**: Se añadió un botón **"Generar con IA"** junto a la etiqueta del campo de descripción, con un estado de carga para el feedback del usuario.
-   **Lógica de Negocio**: Se implementó `handleGenerateDescription`, que recopila los datos del formulario, invoca a `generatePropertyDescription` y actualiza el estado del formulario con el texto recibido, poblando automáticamente el `textarea`.

### Tarea 4.2: IA - Generador de Contenido para Campañas de Marketing (Completada)

#### **`geminiService.ts`**
El servicio de IA se ha expandido con una nueva función para la creación de contenido de marketing.

-   **`generateCampaignBody(userPrompt: string): Promise<string>`**:
    -   **Entrada**: Recibe una instrucción de texto simple del usuario (ej. "Anuncio de nuevas propiedades en Polanco").
    -   **Proceso**: Construye un prompt avanzado para el modelo `gemini-2.5-flash`, pidiéndole que actúe como un experto en marketing inmobiliario. El prompt especifica que la salida debe ser en formato HTML, usar un tono profesional y persuasivo, e incluir el placeholder `{{client_name}}`.
    -   **Salida**: Devuelve el cuerpo del correo electrónico como una cadena de texto HTML, lista para ser usada en el editor de texto enriquecido.

#### **`CampaignFormModal.tsx`**
El modal de creación/edición de campañas ahora incluye un asistente de redacción.

-   **Nuevos Elementos de UI**:
    -   Se ha añadido un botón **"Generar con IA"** junto a la etiqueta del "Cuerpo del Email".
    -   Al hacer clic, se abre un modal (`AIGenerationModal`) que solicita al usuario una instrucción simple.
-   **Lógica de Negocio**:
    -   La función `handleGenerateBody` se encarga de llamar al `geminiService` con la instrucción del usuario.
    -   Muestra un estado de carga mientras se genera el contenido.
    -   Una vez recibida la respuesta, actualiza el estado del editor `ReactQuill` con el HTML generado, rellenando el cuerpo del correo de forma automática.
