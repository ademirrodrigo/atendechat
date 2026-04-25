"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AgendaPage() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ title: "", clientId: "", startsAt: "" });

  async function load() {
    const [a, c] = await Promise.all([api("/appointments"), api("/clients")]);
    setItems(a);
    setClients(c);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    await api("/appointments", { method: "POST", body: JSON.stringify({ ...form, startsAt: new Date(form.startsAt).toISOString() }) });
    await load();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Agenda</h1>
      <form onSubmit={save} className="card grid grid-cols-4 gap-2">
        <input className="border p-2" placeholder="Título" onChange={e => setForm({ ...form, title: e.target.value })} />
        <select className="border p-2" onChange={e => setForm({ ...form, clientId: e.target.value })}>
          <option>Cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="datetime-local" className="border p-2" onChange={e => setForm({ ...form, startsAt: e.target.value })} />
        <button className="bg-blue-600 text-white px-3 rounded">Criar</button>
      </form>
      <ul className="card space-y-2">{items.map(i => <li key={i.id}>{i.title} - {new Date(i.startsAt).toLocaleString()}</li>)}</ul>
    </main>
  );
}
