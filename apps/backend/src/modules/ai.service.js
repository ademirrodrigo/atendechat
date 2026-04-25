import axios from "axios";
import { env } from "../lib/env.js";
import { logError } from "../lib/logger.js";

function fallbackParser(text) {
  const lower = text.toLowerCase();
  const type = lower.includes("pagar") || lower.includes("conta") ? "task" : "appointment";
  return {
    type,
    title: type === "task" ? "Lembrete financeiro" : "Compromisso criado por IA",
    date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    client: "Cliente IA"
  };
}

export async function parseUserInput(text) {
  try {
    const { data } = await axios.post(
      `${env.OLLAMA_URL}/api/generate`,
      {
        model: "llama3.1",
        stream: false,
        prompt: `Extraia JSON com {type,title,date,client} do texto: ${text}`
      },
      { timeout: 15000 }
    );

    const parsed = JSON.parse(data.response.match(/\{[\s\S]*\}/)?.[0] || "{}");
    if (!parsed.type || !parsed.title) return fallbackParser(text);
    return {
      type: parsed.type === "task" ? "task" : "appointment",
      title: String(parsed.title),
      date: parsed.date || new Date().toISOString(),
      client: parsed.client || "Cliente IA"
    };
  } catch (error) {
    logError("ai.parseUserInput", error);
    return fallbackParser(text);
  }
}
