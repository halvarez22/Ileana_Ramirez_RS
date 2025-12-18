const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

export const sendMessageToGroq = async (message: string): Promise<string> => {
  try {
    console.log("💬 Enviando mensaje a Groq:", message);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY not found. The execution environment must provide it.");
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Modelo recomendado de Groq
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual de Iliana Ramirez Real State, una empresa inmobiliaria líder en México. Tu objetivo es ayudar a los usuarios a encontrar propiedades, responder sus preguntas sobre financiamiento y guiarlos en el proceso de compra. Sé amable, profesional, conciso y responde siempre en español. No inventes propiedades, pero puedes hablar sobre los tipos de propiedades que generalmente se ofrecen (casas, departamentos, terrenos) en diversas ubicaciones de México.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error en respuesta de Groq:", errorData);
      if (errorData.error?.code === 429) {
        return "Lo siento, he alcanzado el límite de uso por ahora. Por favor, inténtalo de nuevo más tarde.";
      }
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    console.log("📥 Respuesta recibida de Groq:", reply.substring(0, 100) + "...");

    return reply;

  } catch (error) {
    console.error("❌ Error communicating with Groq API:", error);
    return "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
  }
};

export const parseSearchQueryWithGroq = async (query: string): Promise<any> => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY not found");
    }

    const prompt = `Analiza la siguiente consulta de búsqueda de bienes raíces y extrae los criterios. Si un criterio no se menciona, omítelo. Responde en formato JSON con las claves: type, location, minPrice, maxPrice, bedrooms, bathrooms, amenities.

Consulta: "${query}"

Respuesta JSON:`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 512,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const jsonString = data.choices[0].message.content;

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return {};
    }

  } catch (error) {
    console.error("Error parsing search query with Groq:", error);
    return {};
  }
};

export const generatePropertyDescriptionWithGroq = async (propertyDetails: any): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY not found");
    }

    const amenitiesText = propertyDetails.amenities?.length > 0
      ? `con amenidades como: ${propertyDetails.amenities.slice(0, 5).join(', ')}`
      : '';

    const prompt = `
    Actúa como un redactor inmobiliario experto para Iliana Ramirez Real State en México.
    Genera una descripción de marketing atractiva y profesional para una propiedad con las siguientes características:
    - Tipo: ${propertyDetails.type}
    - Ubicación: ${propertyDetails.city}, ${propertyDetails.state}
    - Recámaras: ${propertyDetails.bedrooms}
    - Baños: ${propertyDetails.bathrooms}
    ${amenitiesText ? `- Amenidades: ${amenitiesText}` : ''}

    La descripción debe ser en español, resaltar los beneficios y tener 2-3 párrafos cortos (máximo 150 palabras).
    Comienza directamente con la descripción.
    `;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Error generating property description with Groq:", error);
    return "No se pudo generar la descripción. Por favor, inténtelo de nuevo.";
  }
};
