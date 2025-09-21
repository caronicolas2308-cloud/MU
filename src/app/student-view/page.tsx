"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function StudentViewPage() {
  const searchParams = useSearchParams();
  const profId = searchParams.get("profId");
  const classId = searchParams.get("classId");
  
  const [profs, setProfs] = useState<Prof[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedProf, setSelectedProf] = useState<number | "">("");
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showProgression, setShowProgression] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialiser avec les paramètres URL si disponibles
    if (profId) {
      setSelectedProf(Number(profId));
    }
    if (classId) {
      setSelectedClass(Number(classId));
    }
    
    // Charger la liste des profs
    fetch("/api/public/profs")
      .then(r => r.json())
      .then(setProfs)
      .finally(() => setLoading(false));
  }, [profId, classId]);

  useEffect(() => {
    if (selectedProf) {
      fetch(`/api/public/classes?profId=${selectedProf}`)
        .then(r => r.json())
        .then(setClasses);
      setSelectedClass("");
      setChapters([]);
    } else {
      setClasses([]);
      setSelectedClass("");
      setChapters([]);
    }
  }, [selectedProf]);

  useEffect(() => {
    if (selectedClass) {
      loadProgression(selectedClass);
    }
  }, [selectedClass]);

  async function loadProgression(classId: number) {
    try {
      const res = await fetch(`/api/public/progression?classId=${classId}`);
      const j = await res.json();
      setChapters(j.chapters || []);
    } catch (error) {
      console.error("Erreur lors du chargement de la progression:", error);
    }
  }

  const handleClassSelect = (classId: number) => {
    setSelectedClass(classId);
    loadProgression(classId);
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Vue Élève</h1>
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          ← Retour à l'accueil
        </Link>
      </div>

      {/* Sélecteurs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir un professeur :
            </label>
            <select
              className="w-full border rounded px-3 py-2 bg-blue-500 text-white border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedProf as any}
              onChange={(e) => setSelectedProf(Number(e.target.value) || "")}
            >
              <option value="">— Choisir un professeur —</option>
              {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir une classe :
            </label>
            <select
              className="w-full border rounded px-3 py-2 bg-blue-500 text-white border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
              value={selectedClass as any}
              onChange={(e) => handleClassSelect(Number(e.target.value) || 0)}
              disabled={!selectedProf}
            >
              <option value="">— Choisir une classe —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
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
                onClick={() => {
                  setShowChapters(!showChapters);
                  setShowProgression(false);
                }}
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

      {!selectedProf && (
        <div className="text-center py-8 text-gray-500">
          Veuillez sélectionner un professeur et une classe pour voir la progression.
        </div>
      )}
    </main>
  );
}
