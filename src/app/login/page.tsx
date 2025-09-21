"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [tab, setTab] = useState<"login"|"signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.ok) {
        const { role } = await res.json();
        r.push(role === "admin" ? "/admin" : "/prof");
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          password: data.password,
          sesame: data.sesame,
        }),
      });
      
      if (res.ok) {
        window.location.href = "/prof";
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Erreur d'inscription");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {tab === "login" ? "Connexion" : "Inscription Professeur"}
        </h1>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-l-md border ${
              tab === "login" 
                ? "bg-blue-500 text-white border-blue-500" 
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-r-md border ${
              tab === "signup" 
                ? "bg-green-500 text-white border-green-500" 
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Inscription Professeur
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={onLogin} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant
              </label>
              <input 
                name="identifier" 
                placeholder="Nom (Admin ou Prof)" 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input 
                name="password" 
                type="password" 
                placeholder="Mot de passe" 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={onSignup} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du professeur
              </label>
              <input 
                name="name" 
                placeholder="Nom (identifiant prof)" 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input 
                name="password" 
                type="password" 
                placeholder="Mot de passe" 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sésame d'inscription
              </label>
              <input 
                name="sesame" 
                type="password"
                placeholder="Sésame d'inscription" 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                required 
              />
              <p className="text-xs text-gray-500 mt-1">
                Le sésame est fourni par l'administrateur pour créer un compte professeur.
              </p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon espace prof"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-500 hover:text-blue-700 text-sm">
            ← Retour à la Vue Élève
          </Link>
        </div>
      </div>
    </section>
  );
}