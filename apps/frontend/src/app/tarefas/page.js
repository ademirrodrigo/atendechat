"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function TarefasPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", kind: "general" });

  async function load() { setTasks(await api("/tasks")); }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    await api("/tasks", { method: "POST", body: JSON.stringify(form) });
    setForm({ title: "", kind: "general" });
    await load();
  }

  async function parseAI() {
    await api("/ai/parse", { method: "POST", body: JSON.stringify({ text: "marcar consulta com Maria amanhã às 10h" }) });
    await load();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Tarefas</h1>
      <form onSubmit={save} className="card flex gap-2">
        <input className="border p-2 flex-1" value={form.title} placeholder="Título" onChange={e => setForm({ ...form, title: e.target.value })} />
        <select className="border p-2" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
          <option value="general">Geral</option><option value="finance">Financeiro</option>
        </select>
        <button className="bg-blue-600 text-white px-3 rounded">Criar</button>
      </form>
      <button className="card" onClick={parseAI}>Criar ação via IA (demo)</button>
      <ul className="card space-y-2">{tasks.map(t => <li key={t.id}>{t.title} - {t.kind}</li>)}</ul>
    </main>
  );
}
