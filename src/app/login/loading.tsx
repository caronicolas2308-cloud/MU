import LoadingNote from "@/components/LoadingNote";

export default function Loading() {
  return (
    <section className="mx-auto max-w-md py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
        <div className="text-center">
          <LoadingNote />
        </div>
      </div>
    </section>
  );
}
