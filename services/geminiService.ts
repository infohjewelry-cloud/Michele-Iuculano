import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateProfessionalBio = async (
  name: string,
  profession: string,
  experience: string,
  skills: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Errore: Chiave API mancante.";

  const prompt = `
    Sei un esperto di marketing per artigiani italiani.
    Scrivi una biografia professionale breve (massimo 300 caratteri) per un profilo lavorativo.
    
    Nome: ${name}
    Professione: ${profession}
    Anni di esperienza: ${experience}
    Competenze chiave: ${skills}
    
    Usa un tono affidabile, professionale e rassicurante. In italiano.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text?.trim() || "Impossibile generare la bio al momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Si è verificato un errore durante la generazione della bio.";
  }
};