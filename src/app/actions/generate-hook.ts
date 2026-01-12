"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// CRITICAL UPDATE: Targeting Gemini 3 Flash Preview
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function generateSalesHook(title: string, price: string, location: string, visualStyle: string) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return null;
    }

    const prompt = `
  You are Yard Wire's top Jamaican sales copywriter.
  
  CONTEXT DATA:
  - Item: "${title}"
  - Price: "${price}" (Analyze this: High value? Low value?)
  - Location: "${location}"
  - Visual Theme: "${visualStyle}" (Adjust tone to match this theme)

  INSTRUCTIONS:
  1. Detect the Category (Car, House, Phone, Food, etc).
  2. Use Category-Specific Jamaican Slang:
     - Car: "Buy & Drive", "Lady Driven", "Clean"
     - House: "Prime Spot", "Turnkey", "Big Yard"
     - Tech: "Mint", "Unlock", "Battery Strong"
     - General: "Hustle", "Link Up", "Deh Ya"
  3. Match the Visual Theme:
     - If Theme is 'cyber': Use ⚡, 🚀, 💎. Words: "Flash Sale", "Power", "Future".
     - If Theme is 'island': Use 🌴, ☀️, 🍹. Words: "Vibes", "Chill", "Breeze".
     - If Theme is 'luxury': Use 🥂, ✨, 🏛️. Words: "Elite", "Status", "Boss".
  
  OUTPUT RULE:
  - Max 7 words.
  - MUST end with 1 relevant emoji.
  - NO quotes. Just the text.
  `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        return null;
    }
}
