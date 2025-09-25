"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getJSON, postForm } from "@/lib/http";
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

const SERENA_TYPES = [
  { value: "cours", label: "Cours" },
  { value: "exos", label: "Exercices" },
  { value: "corr_exos", label: "Correction Exos" },
  { value: "controle", label: "Contrôle" },
  { value: "corr_controle", label: "Correction Contrôle" }
];

export default function UploadPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [selectedChapter, setSelectedChapter] = useState<number | "">("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileInfo, setFileInfo] = useState<{ pages: number; size: string } | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setClassesError(null);
      const data = await getJSON<Class[]>("/api/class");
      setClasses(data);
    } catch (err) {
      setClassesError(err instanceof Error ? err.message : "Erreur lors du chargement des classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError("");
    setUploadSuccess(false);
    
    // Vérifier le format PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés");
      return;
    }

    // Vérifier la taille (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setFile(selectedFile);
    setFileInfo({
      pages: 0, // Will be determined on server
      size: formatFileSize(selectedFile.size)
    });
    
    // Message d'information sur les limites
    setError(""); // Clear any previous errors
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!file || !selectedClass || !selectedChapter || !selectedType) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", selectedClass.toString());
      formData.append("chapterId", selectedChapter.toString());
      formData.append("type", selectedType);
      formData.append("isProtected", isProtected.toString());
      if (isProtected) {
        formData.append("password", password);
      }

      const result = await postForm<{ pages: number }>("/api/upload", formData);
      
      if ("redirect" in result) {
        router.push(result.redirect);
      } else {
        setUploadSuccess(true);
        setFileInfo({
          pages: result.pages,
          size: formatFileSize(file.size)
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSelectedClass("");
    setSelectedChapter("");
    setSelectedType("");
    setPassword("");
    setIsProtected(false);
    setUploadSuccess(false);
    setFileInfo(null);
    setError("");
  };

  const getChaptersForClass = () => {
    const selectedClassData = classes.find(c => c.id === selectedClass);
    return selectedClassData ? selectedClassData.chapters : [];
  };

  if (uploadSuccess && fileInfo) {
    const selectedClassData = classes.find(c => c.id === selectedClass);
    const selectedChapterData = selectedClassData?.chapters.find(ch => ch.id === selectedChapter);
    const selectedTypeData = SERENA_TYPES.find(t => t.value === selectedType);

    return (
      <main className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Confirmation d'Upload</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="text-green-600 text-2xl mr-3">✅</div>
            <h2 className="text-xl font-semibold text-green-800">Upload réussi !</h2>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Fichier :</strong> {file?.name}</p>
            <p><strong>Pages :</strong> {fileInfo.pages}</p>
            <p><strong>Taille :</strong> {fileInfo.size}</p>
            <p><strong>Protégé par mot de passe :</strong> {isProtected ? "Oui" : "Non"}</p>
            <p><strong>Visible pour la classe :</strong> {selectedClassData?.name}</p>
            <p><strong>Chapitre :</strong> {selectedChapterData?.title}</p>
            <p><strong>Rubrique :</strong> {selectedTypeData?.label}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={resetForm}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
          >
            Retour Page Upload
          </button>
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

  return (
    <main className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Upload de Documents</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <ErrorNote message={error} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Côté gauche - Zone de glisser-déposer */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Fichier PDF</h2>
          
          <div
            ref={fileInputRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : file
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {file ? (
              <div>
                <div className="text-green-600 text-4xl mb-2">✅</div>
                <p className="text-green-800 font-medium">{file.name}</p>
                <p className="text-sm text-green-600">{fileInfo?.size}</p>
              </div>
            ) : (
              <div>
                <div className="text-gray-400 text-4xl mb-2">📄</div>
                <p className="text-gray-600">Glissez-déposez votre PDF ici</p>
                <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Format :</strong> PDF exclusivement</p>
            <p><strong>Limite :</strong> 10 pages maximum</p>
            <p><strong>Taille :</strong> 10MB maximum</p>
          </div>

          {/* Protection par mot de passe */}
          {file && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3">Protection par mot de passe</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isProtected"
                    checked={isProtected}
                    onChange={(e) => setIsProtected(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isProtected" className="text-sm">
                    Voulez-vous protéger l'accès à ce PDF par un mot de passe ?
                  </label>
                </div>
                {isProtected && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Côté droit - Sélection classe/chapitre/type */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Organisation</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            {/* Sélection classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe
              </label>
              {loadingClasses ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
                  <LoadingNote />
                </div>
              ) : classesError ? (
                <div className="w-full px-3 py-2 border border-red-300 rounded bg-red-50">
                  <ErrorNote message={classesError} />
                </div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(Number(e.target.value) || "");
                    setSelectedChapter("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">— Sélectionner une classe —</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Sélection chapitre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapitre
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(Number(e.target.value) || "")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedClass}
                required
              >
                <option value="">— Sélectionner un chapitre —</option>
                {getChaptersForClass().map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Chapitre {ch.number} — {ch.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection type de document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document (SERENA)
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">— Sélectionner un type —</option>
                {SERENA_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton de validation */}
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !selectedClass || !selectedChapter || !selectedType || (isProtected && !password)}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Upload en cours..." : "Valider l'upload"}
            </button>
          </div>
        </div>
      </div>

      {/* Bouton retour */}
      <div className="text-center mt-8">
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