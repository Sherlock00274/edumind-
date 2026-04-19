import { GoogleGenAI, Type } from "@google/genai";
import { Card } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cardSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.NUMBER },
    chapter: { type: Type.STRING },
    conceptEn: { type: Type.STRING },
    conceptZh: { type: Type.STRING },
    description: { type: Type.STRING },
    source: { type: Type.STRING },
    inlineQuiz: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ["id", "text"]
          }
        },
        correctAnswer: { type: Type.STRING }
      },
      required: ["question", "options", "correctAnswer"]
    }
  },
  required: ["id", "chapter", "conceptEn", "conceptZh", "description", "source", "inlineQuiz"]
};

export const generateStudyMaterial = async (content: string): Promise<Card[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract key concepts from the following educational material and convert them into a structured learning format. 
      For each concept, provide a name in English and Chinese, a clear description, and a short multiple-choice quiz question. 
      Material: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: cardSchema
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed: Card[] = JSON.parse(text);
    // Add default values for transient fields
    return parsed.map(card => ({
      ...card,
      errorCount: 0
    }));
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
