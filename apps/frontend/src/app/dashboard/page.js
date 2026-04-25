"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api("/dashboard/summary").then(setSummary).catch(() => setSummary({ appointmentsToday: 0, pendingTasks: 0, clients: 0 }));
  }, []);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-3">
        <div className="card">Compromissos hoje: {summary?.appointmentsToday ?? "..."}</div>
        <div className="card">Tarefas pendentes: {summary?.pendingTasks ?? "..."}</div>
        <div className="card">Clientes: {summary?.clients ?? "..."}</div>
      </div>
      <div className="flex gap-3 text-blue-600 underline">
        <Link href="/agenda">Agenda</Link>
        <Link href="/clientes">Clientes</Link>
        <Link href="/tarefas">Tarefas</Link>
        <Link href="/whatsapp">WhatsApp</Link>
      </div>
    </main>
  );
}
