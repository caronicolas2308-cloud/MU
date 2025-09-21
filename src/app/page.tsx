// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Prof = { id: number; name: string };
type Class = { id: number; name: string };
type Doc = { id: number; type: "cours"|"exos"|"corr_exos"|"controle"|"corr_controle"; title: string; isProtected: boolean };
type Chapter = { id: number; number: number; title: string; documents: Doc[] };

const SERENA_LABELS = {
  cours: "Cours",
  exos: "Exercices", 
  corr_exos: "Corrigés d'exercices",
  controle: "Contrôles",
  corr_controle: "Corrigés des contrôles"
};

export default function Home() {
  const [profs, setProfs] = useState<Prof[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedProf, setSelectedProf] = useState<number | "">("");
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showProgression, setShowProgression] = useState(true);
  const [showChapters, setShowChapters] = useState(false);

  useEffect(() => {
    fetch("/api/public/profs").then(r => r.json()).then(setProfs);
  }, []);

  useEffect(() => {
    if (selectedProf) {
      fetch(`/api/public/classes?profId=${selectedProf}`).then(r => r.json()).then(setClasses);
      setSelectedClass("");
      setChapters([]);
    } else {
      setClasses([]);
      setSelectedClass("");
      setChapters([]);
    }
  }, [selectedProf]);

  async function loadProgression(classId: number) {
    const res = await fetch(`/api/public/progression?classId=${classId}`);
    const j = await res.json();
    setChapters(j.chapters || []);
  }

  const handleClassSelect = (classId: number) => {
    setSelectedClass(classId);
    loadProgression(classId);
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Vue Élève</h1>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions :</strong> Utilisez le menu "Vue Élève" en haut de la page pour sélectionner un professeur et une classe, 
          ou utilisez les sélecteurs ci-dessous.
        </p>
      </div>

      {/* Sélecteurs de secours */}
      <div className="flex flex-wrap gap-3">
        <select
          className="border rounded px-3 py-2 bg-blue-500 text-white border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={selectedProf as any}
          onChange={(e) => setSelectedProf(Number(e.target.value) || "")}
        >
          <option value="">— Choisir un professeur —</option>
          {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select
          className="border rounded px-3 py-2 bg-blue-500 text-white border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          value={selectedClass as any}
          onChange={(e) => handleClassSelect(Number(e.target.value) || 0)}
          disabled={!selectedProf}
        >
          <option value="">— Choisir une classe —</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Progression */}
      {chapters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button 
              className={`px-4 py-2 rounded border ${showProgression ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => {
                setShowProgression(true);
                setShowChapters(false);
              }}
            >
              Progression
            </button>
            <div className="relative">
              <button 
                className={`px-4 py-2 rounded border ${showChapters ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                onMouseEnter={() => setShowChapters(true)}
                onMouseLeave={() => setShowChapters(false)}
              >
                Chapitres
              </button>
              {showChapters && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-64">
                  <div className="p-3">
                    {chapters.map(chapter => (
                      <div key={chapter.id} className="mb-2 last:mb-0">
                        <div className="font-medium text-sm mb-1">
                          Chapitre {chapter.number} — {chapter.title}
                        </div>
                        <div className="ml-4 space-y-1">
                          {Object.entries(SERENA_LABELS).map(([type, label]) => {
                            const doc = chapter.documents.find(d => d.type === type);
                            if (!doc) {
                              return (
                                <div key={type} className="text-sm text-gray-400 px-2 py-1">
                                  {label} (non disponible)
                                </div>
                              );
                            }
                            return (
                              <Link
                                key={type}
                                href={`/viewer/${doc.id}`}
                                className="block text-sm px-2 py-1 hover:bg-gray-50 rounded"
                                title={doc.isProtected ? "Protégé par mot de passe" : "Accès libre"}
                              >
                                {label} {doc.isProtected ? "🔒" : ""}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {showProgression && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Progression de l'année</h3>
              <ul className="grid gap-3">
                {chapters.map(ch => (
                  <li key={ch.id} className="border rounded-lg p-4 bg-white">
                    <div className="font-semibold mb-2">Chapitre {ch.number} — {ch.title}</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SERENA_LABELS).map(([type, label]) => {
                        const d = ch.documents.find(x => x.type === type);
                        if (!d) {
                          return (
                            <span key={type} className="px-3 py-1 text-sm border rounded opacity-40">
                              {label}
                            </span>
                          );
                        }
                        return (
                          <Link
                            key={type}
                            href={`/viewer/${d.id}`}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                            title={d.isProtected ? "Protégé par mot de passe" : "Accès libre"}
                          >
                            {label} {d.isProtected ? "🔒" : ""}
                          </Link>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {chapters.length === 0 && selectedProf && selectedClass && (
        <div className="text-center py-8 text-gray-500">
          Aucun chapitre trouvé pour cette classe.
        </div>
      )}
    </section>
  );
}