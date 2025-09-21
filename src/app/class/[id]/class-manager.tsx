// src/app/class/[id]/class-manager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Chapter = { id: number; number: number; title: string; classId: number };
type ClassItem = { id: number; name: string; chapters: Chapter[] };

export default function ClassManager({ initialClass }: { initialClass: ClassItem }) {
  const r = useRouter();
  const [klass, setKlass] = useState<ClassItem>(initialClass);
  const [renamingClass, setRenamingClass] = useState(false);
  const [newClassName, setNewClassName] = useState(klass.name);
  const [adding, setAdding] = useState(false);
  const [newChapTitle, setNewChapTitle] = useState("");

  async function refresh() {
    // Re-fetch minimal via API classes, puis on prend celle voulue.
    const res = await fetch("/api/classes", { cache: "no-store" });
    if (res.ok) {
      const arr: ClassItem[] = await res.json();
      const fresh = arr.find(c => c.id === klass.id);
      if (fresh) setKlass(fresh);
    }
  }

  async function renameClass() {
    if (!newClassName.trim()) return;
    setRenamingClass(true);
    try {
      const res = await fetch(`/api/classes/${klass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Renommage impossible");
      } else {
        await refresh();
        setRenamingClass(false);
      }
    } finally {
      setRenamingClass(false);
    }
  }

  async function renameChapter(ch: Chapter, nextTitle: string) {
    const title = nextTitle.trim();
    if (!title) return;
    const res = await fetch(`/api/chapters/${ch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "Renommage impossible");
    } else {
      await refresh();
    }
  }

  async function addChapter() {
    if (!newChapTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/chapters/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: klass.id, title: newChapTitle.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Ajout impossible");
      } else {
        setNewChapTitle("");
        await refresh();
      }
    } finally {
      setAdding(false);
    }
  }

  async function deleteChapter(ch: Chapter) {
    if (ch.number <= 2) {
      alert("Les Chapitres 1 et 2 sont indestructibles.");
      return;
    }
    const ok = confirm(`Supprimer "${ch.title}" (Chapitre ${ch.number}) ?`);
    if (!ok) return;

    const res = await fetch(`/api/chapters/${ch.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "Suppression impossible");
    } else {
      await refresh();
    }
  }

  return (
    <section className="space-y-8">
      {/* Bloc renommage classe */}
      <div className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Nom de la classe</h2>
        <div className="flex gap-2">
          <input
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            onClick={renameClass}
            disabled={renamingClass}
            className="rounded px-4 py-2 bg-indigo-600 text-white disabled:opacity-60"
          >
            {renamingClass ? "Enregistrement..." : "Modifier"}
          </button>
          <button onClick={() => r.push("/prof")} className="rounded px-3 py-2 border">
            Retour Page Prof
          </button>
        </div>
      </div>

      {/* Liste chapitres */}
      <div className="border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Chapitres</h3>
        <ul className="grid gap-3">
          {klass.chapters.map((ch) => (
            <li key={ch.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-600 shrink-0">Chapitre {ch.number}</div>
                <input
                  defaultValue={ch.title}
                  onBlur={(e) => {
                    const val = e.currentTarget.value;
                    if (val !== ch.title) renameChapter(ch, val);
                  }}
                  className="flex-1 rounded border px-3 py-2"
                />
                <button
                  onClick={() => deleteChapter(ch)}
                  className={`rounded px-3 py-2 border ${
                    ch.number <= 2 ? "opacity-40 cursor-not-allowed" : "hover:bg-red-50"
                  }`}
                  disabled={ch.number <= 2}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={newChapTitle}
            onChange={(e) => setNewChapTitle(e.target.value)}
            placeholder="Titre du nouveau chapitre"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            onClick={addChapter}
            disabled={adding}
            className="rounded px-4 py-2 bg-blue-600 text-white disabled:opacity-60"
          >
            {adding ? "Ajout..." : "Ajouter un chapitre"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Les chapitres <strong>1</strong> et <strong>2</strong> sont indestructibles.
        </p>
      </div>
    </section>
  );
}