"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/prof/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setClasses(data.classes || []);
      } else {
        router.push("/login");
      }
    } catch (err) {
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
      const response = await fetch(`/api/class/${classId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Recharger la page pour mettre à jour la liste
        window.location.reload();
      } else {
        alert("Erreur lors de la suppression de la classe");
      }
    } catch (err) {
      alert("Erreur de connexion");
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-6">
        <div className="text-center">
          <p>Erreur de chargement</p>
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
          <form id="createClassForm" className="flex gap-3">
            <input
              type="text"
              name="name"
              placeholder="Nom de la classe (ex. Terminale A, 2nde B)"
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 active:bg-green-700 transition-colors"
            >
              Valider
            </button>
          </form>
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

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('createClassForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const className = formData.get('name');
            
            try {
              const response = await fetch('/api/class/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  name: className,
                  chapters: [
                    { number: 1, title: 'Chapitre 1' },
                    { number: 2, title: 'Chapitre 2' }
                  ]
                })
              });
              
              if (response.ok) {
                const data = await response.json();
                window.location.href = '/class/' + data.classId;
              } else {
                const error = await response.json();
                alert('Erreur: ' + (error.error || 'Erreur lors de la création'));
              }
            } catch (err) {
              alert('Erreur de connexion');
            }
          });
        `
      }} />
    </main>
  );
}