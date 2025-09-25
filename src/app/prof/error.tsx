"use client";

import { useEffect } from "react";
import ErrorNote from "@/components/ErrorNote";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-4xl mx-auto py-6">
      <div className="text-center">
        <ErrorNote message="Une erreur est survenue." />
        <button
          onClick={reset}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
