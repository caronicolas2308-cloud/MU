"use client";

type Props = {
  formId: string;           // l’id du <form> à soumettre
  label: string;            // texte du bouton
  confirmText?: string;     // message de confirmation
  submitAction: string;     // URL d’action du form (sécurité côté client)
};

export default function ConfirmSubmitButton({
  formId,
  label,
  confirmText = "Confirmer ?",
  submitAction,
}: Props) {
  return (
    <button
      type="button"
      style={{ padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}
      onClick={() => {
        if (!confirm(confirmText)) return;
        const form = document.getElementById(formId) as HTMLFormElement | null;
        if (!form) return;
        // double sécurité : s’assurer que l’action est bien celle attendue
        if (submitAction) form.action = submitAction;
        form.requestSubmit();
      }}
    >
      {label}
    </button>
  );
}