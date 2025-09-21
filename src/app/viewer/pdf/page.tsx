export default function PdfViewer({ searchParams }: { searchParams: { url?: string } }) {
  const url = searchParams.url ?? "";
  if (!url) return <p>Aucune URL fournie.</p>;
  return (
    <section className="h-[80vh]">
      <iframe src={url} className="h-full w-full rounded border" />
    </section>
  );
}