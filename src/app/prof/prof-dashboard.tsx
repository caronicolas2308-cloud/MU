// src/app/prof/prof-dashboard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type Chapter = { id: number; number: number; title: string; classId: number };
type ClassItem = { id: number; name: string; chapters: Chapter[] };

export default function ProfDashboard({ initialClasses }: { initialClasses: ClassItem[] }) {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  async function refreshClasses() {
    const res = await fetch("/api/classes", { cache: "no-store" });
    if (res.ok) setClasses(await res.json());
    else alert("Impossible de charger les classes.");
  }

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/classes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Création impossible.");
      } else {
        setNewName("");
        await refreshClasses();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Mes classes</h2>
          <Link href="/upload" className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            Uploader un PDF
          </Link>
        </div>

        {classes.length === 0 ? (
          <p className="text-gray-600">Aucune classe pour le moment.</p>
        ) : (
          <ul className="grid gap-3">
            {classes.map((c) => (
              <li key={c.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      {c.chapters.length} chapitre{c.chapters.length > 1 ? "s" : ""}
                    </div>
                  </div>
                  <Link href={`/class/${c.id}`} className="rounded-lg px-3 py-2 border hover:bg-gray-50">
                    Gérer cette classe
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Créer une classe</h3>
        <form onSubmit={createClass} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la classe (ex. 2nde A)"
            className="flex-1 rounded border px-3 py-2"
          />
        <button disabled={creating} className="rounded px-4 py-2 bg-indigo-600 text-white disabled:opacity-60">
            {creating ? "Création..." : "Valider"}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          À la création, <strong>Chapitre 1</strong> et <strong>Chapitre 2</strong> sont générés automatiquement.
        </p>
      </div>
    </section>
  );
}