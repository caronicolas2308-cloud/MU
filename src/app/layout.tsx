import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { MegaMenu } from "../components/MegaMenu";

export const metadata = { title: "Maths Upload" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await getCurrentUser();

  return (
    <html lang="fr">
      <body className="min-h-screen text-black flex flex-col" style={{ backgroundColor: '#FF7E00' }}>
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
          <nav className="max-w-6xl mx-auto px-4 py-3">
            <MegaMenu user={u} />
          </nav>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">{children}</main>

        <footer className="border-t bg-white mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500">
            © {new Date().getFullYear()} Maths Upload
          </div>
        </footer>
      </body>
    </html>
  );
}