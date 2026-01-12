const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env.local");
        return;
    }
    console.log("✅ API Key found (ends with " + apiKey.slice(-4) + ")");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    try {
        console.log("Attempting to generate content...");
        const result = await model.generateContent("Say 'Hello from Gemini 3'");
        const response = await result.response;
        const text = response.text();
        console.log("✅ SUCCESS! Response:", text);
    } catch (error) {
        console.error("❌ GENERATION FAILED:", error.message);
        if (error.message.includes("404")) {
            console.error("👉 This usually means the model version is incorrect or you don't have access to the preview yet.");
        }
    }
}

testGemini();
