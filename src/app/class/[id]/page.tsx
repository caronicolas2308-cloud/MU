"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getJSON, postForm, postJSON } from "@/lib/http";
import LoadingNote from "@/components/LoadingNote";
import ErrorNote from "@/components/ErrorNote";

type Chapter = {
  id: number;
  number: number;
  title: string;
  documents?: Array<{
    id: number;
    type: string;
    title: string;
  }>;
};

type ClassData = {
  id: number;
  name: string;
  chapters: Chapter[];
};

const SERENA_RUBRICS = [
  "Cours",
  "Exos", 
  "Correction Exos",
  "Contrôle",
  "Correction Contrôle"
];

export default function ClassManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingChapter, setUpdatingChapter] = useState<number | null>(null);
  const [addingChapter, setAddingChapter] = useState(false);
  const [deletingChapter, setDeletingChapter] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadClassData();
  }, [resolvedParams.id]);

  const loadClassData = async () => {
    try {
      setError("");
      const data = await getJSON<ClassData>(`/api/class/${resolvedParams.id}`);
      setClassData(data);
      setNewClassName(data.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const updateClassName = async () => {
    if (!newClassName.trim()) return;
    
    setUpdatingName(true);
    try {
      const formData = new FormData();
      formData.append("name", newClassName);
      formData.append("_method", "PATCH");

      const result = await postForm(`/api/class/${resolvedParams.id}`, formData);
      
      if ("redirect" in result) {
        router.push(result.redirect);
      } else {
        setClassData(prev => prev ? { ...prev, name: newClassName } : null);
        setEditingName(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du nom");
    } finally {
      setUpdatingName(false);
    }
  };

  const updateChapterTitle = async (chapterId: number, newTitle: string) => {
    setUpdatingChapter(chapterId);
    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("_method", "PATCH");

      const result = await postForm(`/api/class/${resolvedParams.id}/chapters/${chapterId}`, formData);
      
      if ("redirect" in result) {
        router.push(result.redirect);
      } else {
        setClassData(prev => prev ? {
          ...prev,
          chapters: prev.chapters.map(ch => 
            ch.id === chapterId ? { ...ch, title: newTitle } : ch
          )
        } : null);
        setEditingChapter(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du chapitre");
    } finally {
      setUpdatingChapter(null);
    }
  };

  const deleteChapter = async (chapterId: number) => {
    if (chapterId <= 2) return; // Cannot delete chapters 1 and 2
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce chapitre ? Cette action est irréversible.")) {
      return;
    }

    setDeletingChapter(chapterId);
    try {
      const formData = new FormData();
      formData.append("_method", "DELETE");

      const result = await postForm(`/api/class/${resolvedParams.id}/chapters/${chapterId}`, formData);
      
      if ("redirect" in result) {
        router.push(result.redirect);
      } else {
        setClassData(prev => prev ? {
          ...prev,
          chapters: prev.chapters.filter(ch => ch.id !== chapterId)
        } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression du chapitre");
    } finally {
      setDeletingChapter(null);
    }
  };

  const addChapter = async () => {
    if (!newChapterName.trim()) return;

    setAddingChapter(true);
    try {
      const formData = new FormData();
      formData.append("title", newChapterName);

      const result = await postForm(`/api/class/${resolvedParams.id}/chapters`, formData);
      
      if ("redirect" in result) {
        router.push(result.redirect);
      } else {
        // Recharger les données pour avoir le nouveau chapitre
        await loadClassData();
        setNewChapterName("");
        setShowAddChapter(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout du chapitre");
    } finally {
      setAddingChapter(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-6">
        <div className="text-center">
          <LoadingNote />
        </div>
      </main>
    );
  }

  if (error || !classData) {
    return (
      <main className="max-w-4xl mx-auto py-6">
        <div className="text-center">
          {error ? <ErrorNote message={error} /> : <p>Classe non trouvée</p>}
        </div>
        <div className="text-center mt-4">
          <Link href="/prof" className="text-blue-500 hover:text-blue-700">
            ← Retour à la Page Prof
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestion de Classe</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Nom de la classe */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Nom de la classe</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            {editingName ? (
              <>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={updateClassName}
                  disabled={updatingName}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {updatingName ? "Mise à jour..." : "Valider"}
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewClassName(classData.name);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <span className="text-xl font-medium">{classData.name}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Modifier nom_classe
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Modifier la progression */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Modifier la progression</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {classData.chapters.map((chapter) => (
              <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Chapitre {chapter.number}:</span>
                    {editingChapter === chapter.id ? (
                      <>
                        <input
                          type="text"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Titre du chapitre"
                        />
                        <button
                          onClick={() => updateChapterTitle(chapter.id, newChapterTitle)}
                          disabled={updatingChapter === chapter.id}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          {updatingChapter === chapter.id ? "Mise à jour..." : "Valider"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingChapter(null);
                            setNewChapterTitle("");
                          }}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">{chapter.title}</span>
                        <button
                          onClick={() => {
                            setEditingChapter(chapter.id);
                            setNewChapterTitle(chapter.title);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Modifier nom
                        </button>
                      </>
                    )}
                  </div>
                  {chapter.number > 2 && (
                    <button
                      onClick={() => deleteChapter(chapter.id)}
                      disabled={deletingChapter === chapter.id}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingChapter === chapter.id ? "Suppression..." : "Supprimer"}
                    </button>
                  )}
                </div>

                {/* Rubriques SERENA */}
                <div className="ml-6">
                  <p className="text-sm text-gray-600 mb-2">Rubriques SERENA :</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {SERENA_RUBRICS.map((rubric) => {
                      const doc = chapter.documents?.find(d => d.type === rubric.toLowerCase().replace(' ', '_'));
                      return (
                        <div
                          key={rubric}
                          className={`px-3 py-2 rounded text-sm text-center ${
                            doc 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {rubric} {doc ? '✓' : '○'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Ajouter un chapitre */}
            {showAddChapter ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="Titre du nouveau chapitre"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addChapter}
                    disabled={addingChapter}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {addingChapter ? "Ajout..." : "Valider"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddChapter(false);
                      setNewChapterName("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddChapter(true)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Ajouter un chapitre
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            <strong>Note:</strong> Les chapitres 1 et 2 sont indestructibles (seul le nom peut être modifié).
            Les chapitres 3 et suivants peuvent être supprimés.
          </p>
        </div>
      </section>

      {/* Bouton retour */}
      <div className="text-center">
        <Link
          href="/prof"
          className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors"
        >
          Retour Page Prof
        </Link>
      </div>
    </main>
  );
}