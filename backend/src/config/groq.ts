import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export const getGroqClient = (): Groq => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY no esta configurada en .env");
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }

  return groqClient;
};

export const getGroqModel = (): string => {
  return process.env.GROQ_MODEL || "llama-3.1-8b-instant";
};
