import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">AtendeChat MVP</h1>
      <Link className="text-blue-600 underline" href="/login">Ir para Login</Link>
    </main>
  );
}
