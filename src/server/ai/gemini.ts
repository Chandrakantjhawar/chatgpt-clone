import { GoogleGenerativeAI } from "@google/generative-ai";

export const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const TEXT_MODEL = "gemini-2.0-flash";  // or 1.5-flash if you prefer
export const IMAGE_MODEL = "gemini-1.5-flash"; // image-capable model
