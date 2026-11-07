import Button from "../ui/Button";

const ConfirmDialog = ({ open, title, description, confirmLabel = "Confirm", onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-heading">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
