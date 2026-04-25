import axios from "axios";
import { env } from "../lib/env.js";

const api = axios.create({
  baseURL: env.EVOLUTION_API_URL,
  headers: {
    apikey: env.EVOLUTION_API_KEY,
    "Content-Type": "application/json"
  },
  timeout: 15000
});

function formatPhone(phone) {
  return phone.replace(/\D/g, "");
}

export async function createSession(sessionName = env.EVOLUTION_INSTANCE) {
  const { data } = await api.post("/instance/create", {
    instanceName: sessionName,
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  });
  return data;
}

export async function getQRCode(sessionName = env.EVOLUTION_INSTANCE) {
  const { data } = await api.get(`/instance/connect/${sessionName}`);
  return data;
}

export async function checkStatus(sessionName = env.EVOLUTION_INSTANCE) {
  const { data } = await api.get(`/instance/connectionState/${sessionName}`);
  return data;
}

export async function sendMessage({ sessionName = env.EVOLUTION_INSTANCE, phone, message }) {
  const { data } = await api.post(`/message/sendText/${sessionName}`, {
    number: formatPhone(phone),
    text: message
  });
  return data;
}
