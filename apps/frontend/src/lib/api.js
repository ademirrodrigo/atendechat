const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function api(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
