import LoadingNote from "@/components/LoadingNote";

export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Upload de Documents</h1>
      <div className="text-center">
        <LoadingNote />
      </div>
    </main>
  );
}
