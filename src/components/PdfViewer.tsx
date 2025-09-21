"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

interface PdfViewerProps {
  documentId: number;
  blobUrl: string;
  isProtected: boolean;
  onPasswordRequired: (callback: (password: string) => void) => void;
  onDownload: () => void;
}

export function PdfViewer({ 
  documentId, 
  blobUrl, 
  isProtected, 
  onPasswordRequired, 
  onDownload 
}: PdfViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadPdf = async (password?: string) => {
    try {
      setLoading(true);
      setError("");

      const loadingTask = pdfjsLib.getDocument({
        url: blobUrl,
        password: password,
      });

      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
      setShowPasswordForm(false);
    } catch (err: any) {
      if (err.name === "PasswordException") {
        setShowPasswordForm(true);
        onPasswordRequired((pwd: string) => {
          setPassword(pwd);
          loadPdf(pwd);
        });
      } else {
        setError("Erreur lors du chargement du PDF");
        console.error("PDF loading error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Page rendering error:", err);
      setError("Erreur lors du rendu de la page");
    }
  };

  useEffect(() => {
    if (isProtected && !password) {
      setShowPasswordForm(true);
      onPasswordRequired((pwd: string) => {
        setPassword(pwd);
        loadPdf(pwd);
      });
    } else {
      loadPdf(password);
    }
  }, [blobUrl, isProtected]);

  useEffect(() => {
    if (pdf) {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, scale]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPdf(password);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 1.5)); // Max 150%
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5)); // Min 50%
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    // Scroll avec la molette pour naviguer entre les pages
    if (e.deltaY < 0) {
      handlePreviousPage(); // Scroll vers le haut = page précédente
    } else {
      handleNextPage(); // Scroll vers le bas = page suivante
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement du PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (showPasswordForm) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full">
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
                placeholder="Entrez le mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Ouvrir le PDF
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Zoom -
          </button>
          <span className="text-sm text-gray-600 min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 1.5}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Zoom +
          </button>
        </div>

        <button
          onClick={onDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          📥 Télécharger
        </button>
      </div>

      {/* PDF Canvas */}
      <div 
        className="overflow-auto max-h-screen"
        onWheel={handleScroll}
      >
        <div className="flex justify-center p-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 shadow-lg"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
        <p className="text-xs text-blue-800 text-center">
          <strong>Instructions :</strong> Utilisez la molette de la souris pour naviguer entre les pages, 
          ou les boutons Précédent/Suivant. Le zoom est limité entre 50% et 150%.
        </p>
      </div>
    </div>
  );
}