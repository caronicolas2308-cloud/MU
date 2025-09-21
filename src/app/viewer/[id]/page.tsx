"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PdfViewer } from "@/components/PdfViewer";

type DocumentData = {
  id: number;
  title: string;
  type: string;
  blobUrl: string;
  isProtected: boolean;
  chapter: {
    title: string;
    number: number;
    class: {
      name: string;
      prof: {
        name: string;
      };
    };
  };
};

const SERENA_LABELS: Record<string, string> = {
  cours: "Cours",
  exos: "Exercices",
  corr_exos: "Corrigés d'exercices",
  controle: "Contrôles",
  corr_controle: "Corrigés des contrôles"
};

export default function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCallback, setPasswordCallback] = useState<((password: string) => void) | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDocument();
  }, [resolvedParams.id]);

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else if (response.status === 401) {
        setError("Accès non autorisé à ce document");
      } else if (response.status === 404) {
        setError("Document non trouvé");
      } else {
        setError("Erreur lors du chargement du document");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRequired = (callback: (password: string) => void) => {
    setPasswordCallback(() => callback);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordCallback) {
      passwordCallback(password);
      setPasswordCallback(null);
      setPassword("");
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      // Fetch the PDF with watermark
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("Erreur lors du téléchargement");
      }
    } catch (err) {
      setError("Erreur lors du téléchargement");
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Chargement du document...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="max-w-6xl mx-auto py-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-4">
            {error || "Document non trouvé"}
          </div>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700"
          >
            ← Retour à la Vue Élève
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700"
          >
            ← Retour à la Vue Élève
          </Link>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Professeur :</span>
              <span className="ml-2">{document.chapter.class.prof.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Classe :</span>
              <span className="ml-2">{document.chapter.class.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Chapitre :</span>
              <span className="ml-2">Chapitre {document.chapter.number} — {document.chapter.title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type :</span>
              <span className="ml-2">{SERENA_LABELS[document.type] || document.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Protection :</span>
              <span className="ml-2">
                {document.isProtected ? (
                  <span className="text-red-600">🔒 Protégé par mot de passe</span>
                ) : (
                  <span className="text-green-600">🔓 Accès libre</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password form overlay */}
      {passwordCallback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">
              PDF protégé par mot de passe
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le mot de passe fourni par votre professeur"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Ouvrir le PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordCallback(null);
                    setPassword("");
                    router.back();
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <PdfViewer
        documentId={document.id}
        blobUrl={document.blobUrl}
        isProtected={document.isProtected}
        onPasswordRequired={handlePasswordRequired}
        onDownload={handleDownload}
      />

      {/* Footer with Maths Upload branding */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          Téléchargé sur le site Maths Upload. Ce PDF a été créé par {document.chapter.class.prof.name} 
          pour la classe {document.chapter.class.name}.
        </p>
      </div>
    </main>
  );
}