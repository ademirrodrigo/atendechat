"use client";

import { useState } from "react";
import { api } from "../../lib/api";

export default function WhatsappPage() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("desconectado");
  const [phone, setPhone] = useState("");

  async function connect() {
    const data = await api("/whatsapp/connect", { method: "POST" });
    setQr(data.qrCode);
  }

  async function refreshStatus() {
    const data = await api("/whatsapp/status");
    setStatus(data.instance?.state || JSON.stringify(data));
  }

  async function sendTest() {
    await api("/whatsapp/test-send", {
      method: "POST",
      body: JSON.stringify({ phone, message: "Mensagem teste AtendeChat MVP" })
    });
    alert("Mensagem enviada");
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Integração WhatsApp</h1>
      <div className="card flex gap-2">
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={connect}>Conectar</button>
        <button className="bg-slate-700 text-white px-3 py-2 rounded" onClick={refreshStatus}>Atualizar status</button>
      </div>
      <div className="card">Status: {status}</div>
      {qr && <img className="w-72" src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`} alt="QR Code" />}
      <div className="card flex gap-2">
        <input className="border p-2 flex-1" placeholder="Número para teste" onChange={e => setPhone(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={sendTest}>Enviar teste</button>
      </div>
    </main>
  );
}
