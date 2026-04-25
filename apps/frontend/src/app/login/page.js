"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function onSubmit(e) {
    e.preventDefault();
    if (mode === "register") {
      await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
    }
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify(form) });
    localStorage.setItem("token", data.token);
    router.push("/dashboard");
  }

  return (
    <div className="card max-w-md mx-auto space-y-3">
      <h1 className="font-bold text-xl">{mode === "login" ? "Login" : "Cadastro"}</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        {mode === "register" && <input className="w-full border p-2" placeholder="Nome" onChange={e => setForm({ ...form, name: e.target.value })} />}
        <input className="w-full border p-2" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border p-2" type="password" placeholder="Senha" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Entrar</button>
      </form>
      <button className="text-blue-600 underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>Trocar para {mode === "login" ? "Cadastro" : "Login"}</button>
    </div>
  );
}
