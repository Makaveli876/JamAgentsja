"use server";

import { GoogleGenAI } from "@google/genai";

const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
    }
    const genAI = new GoogleGenAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export async function optimizeListing(text: string) {
    if (!text) return text;

    try {
        const model = getModel();
        const prompt = `Rewrite the following business listing into "Hyped Marketing Copy" for WhatsApp Status. 
    Make it punchy, use emojis, and focus on the premium quality. Keep it concise.
    
    Listing: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return text; // Fallback
    }
}
