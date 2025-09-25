import LoadingNote from "@/components/LoadingNote";

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-center h-96">
        <LoadingNote />
      </div>
    </main>
  );
}
