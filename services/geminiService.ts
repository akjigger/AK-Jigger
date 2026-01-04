
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini AI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBoilermakerRecommendation = async (userMood: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a perfect Boilermaker (Beer + Whiskey shot pairing) for someone feeling "${userMood}". 
    The bar is named B.O.P (Bartender of Pony). Give a creative name for the combo, explain why they match, and describe the flavor profile.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          comboName: { type: Type.STRING },
          beer: { type: Type.STRING },
          whiskey: { type: Type.STRING },
          description: { type: Type.STRING },
          pairingTip: { type: Type.STRING }
        },
        required: ["comboName", "beer", "whiskey", "description", "pairingTip"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const getChickenWisdom = async (question: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are "Chicken Sensei", the wise mascot of B.O.P (Bartender of Pony) bar. 
    A customer is waiting for a table and asks: "${question}". 
    Provide a short, funny, and slightly philosophical answer using fried chicken or beer metaphors.`,
    config: {
      systemInstruction: "You are a humorous and wise bar mascot who speaks in fried chicken puns and beer wisdom."
    }
  });
  return response.text;
};

export const getCocktailIdentity = async (answers: string[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on these personality answers: [${answers.join(", ")}], determine which B.O.P (Bartender of Pony) Signature Cocktail matches the user's soul. 
    Options: 'Iced SoMaek', 'Cheng & Tonic', 'Honey Maksky Sour', 'Perilla Smash', 'Bokbunja POP', 'Hallabong Bellini', 'Banana Makgeoli Colada', 'Ice Dalgona Coffee', 'Buldak Penicillin', 'K-Town Manhattan', 'BOP Martini (Filthy Martini)', 'Honey Butter Godfather'.
    Provide a witty description of why they are this cocktail, their 'drinking personality', and a 'spirit animal' that matches the drink's vibe.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cocktailName: { type: Type.STRING },
          description: { type: Type.STRING },
          personality: { type: Type.STRING },
          spiritAnimal: { type: Type.STRING }
        },
        required: ["cocktailName", "description", "personality", "spiritAnimal"]
      }
    }
  });
  return JSON.parse(response.text);
};
