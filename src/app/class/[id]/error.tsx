"use client";

import { useEffect } from "react";
import Link from "next/link";
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
        <div className="mt-4 space-x-4">
          <button
            onClick={reset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
          <Link
            href="/prof"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Retour Page Prof
          </Link>
        </div>
      </div>
    </main>
  );
}
