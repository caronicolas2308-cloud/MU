// src/components/ErrorNote.tsx - Composant d'affichage d'erreur simple

interface ErrorNoteProps {
  message: string;
}

export default function ErrorNote({ message }: ErrorNoteProps) {
  return <div style={{ color: "red" }}>Erreur : {message}</div>;
}
