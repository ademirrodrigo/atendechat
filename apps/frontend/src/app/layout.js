import "./globals.css";

export const metadata = { title: "AtendeChat MVP" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="max-w-6xl mx-auto p-4">{children}</body>
    </html>
  );
}
