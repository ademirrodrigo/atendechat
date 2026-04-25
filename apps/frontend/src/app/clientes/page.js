"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: "", whatsappNumber: "" });

  async function load() { setClients(await api("/clients")); }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    await api("/clients", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", whatsappNumber: "" });
    await load();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Clientes</h1>
      <form onSubmit={save} className="card flex gap-2">
        <input className="border p-2 flex-1" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2" placeholder="WhatsApp" value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} />
        <button className="bg-blue-600 text-white px-3 rounded">Salvar</button>
      </form>
      <ul className="card space-y-2">{clients.map(c => <li key={c.id}>{c.name} - {c.whatsappNumber}</li>)}</ul>
    </main>
  );
}
