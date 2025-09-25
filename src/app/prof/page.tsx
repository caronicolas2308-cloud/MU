"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJSON, postJSON } from "@/lib/http";
import LoadingNote from "@/components/LoadingNote";
import ErrorNote from "@/components/ErrorNote";

type Class = {
  id: number;
  name: string;
  chapters: Array<{
    id: number;
    number: number;
    title: string;
  }>;
};

export default function ProfPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [creatingClass, setCreatingClass] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const data = await getJSON<{ user: any; classes: Class[] }>("/api/prof/profile");
      setUser(data.user);
      setClasses(data.classes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une classe
  async function deleteClass(classId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.")) {
      return;
    }

    try {
      await getJSON(`/api/class/${classId}`, { method: "DELETE" });
      // Recharger la liste des classes
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  // Fonction pour créer une classe
  async function createClass(className: string) {
    setCreatingClass(true);
    setCreateError(null);
    
    try {
      const result = await postJSON<{ success: boolean; classId: number }>("/api/class/create", {
        name: className,
        chapters: [
          { title: "Chapitre 1" },
          { title: "Chapitre 2" }
        ]
      });

      if ("redirect" in result) {
        router.push(result.redirect);
      } else if (result.success) {
        router.push(`/class/${result.classId}`);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setCreatingClass(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <LoadingNote />
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="max-w-4xl mx-auto py-6">
        <div className="text-center">
          {error ? <ErrorNote message={error} /> : <p>Erreur de chargement</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gérer Compte Prof</h1>
        <p className="text-lg text-gray-600">Bonjour, <span className="font-semibold text-black">{user.prof?.name || 'Professeur'}</span></p>
      </div>

      {/* Mes classes */}
      <section className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mes classes</h2>

          {classes.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">Aucune classe pour le moment.</p>
              <p className="text-sm text-gray-500">Créez votre première classe ci-dessous.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{c.name}</h3>
                      <p className="text-sm text-gray-600">
                        {c.chapters.length} chapitres
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/class/${c.id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 active:bg-blue-700 transition-colors"
                      >
                        Gérer cette classe
                      </Link>
                      <button
                        onClick={() => deleteClass(c.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 active:bg-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Créer une classe */}
      <section className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Créer une classe</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const className = formData.get("name") as string;
            if (className) createClass(className);
          }} className="flex gap-3">
            <input
              type="text"
              name="name"
              placeholder="Nom de la classe (ex. Terminale A, 2nde B)"
              required
              disabled={creatingClass}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              disabled={creatingClass}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50"
            >
              {creatingClass ? "Création..." : "Valider"}
            </button>
          </form>
          {createError && <ErrorNote message={createError} />}
          <p className="text-sm text-gray-600 mt-3">
            À la création, <strong>Chapitre 1</strong> et <strong>Chapitre 2</strong> sont générés automatiquement avec la rubrique SERENA.
          </p>
        </div>
      </section>

      {/* Upload de documents */}
      <section>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload de documents</h2>
          <div className="text-center">
            <Link
              href="/upload"
              className="inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              📄 Uploader un Cours/Exo/Contrôle/Corrigé
            </Link>
            <p className="text-sm text-gray-600 mt-3">
              Glissez-déposez vos PDF (max 10 pages) et organisez-les par classe et chapitre.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}