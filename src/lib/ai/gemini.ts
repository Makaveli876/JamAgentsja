
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Creative Model (Flash is fast & cheap)
export const creativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Grounded Model (Pro is better for reasoning/RAG) - Use Flash for speed if budget constraint
export const groundedModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateEmbedding(text: string) {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}
