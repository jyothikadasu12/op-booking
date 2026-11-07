import { useEffect } from "react";

const Modal = ({ open, title, children, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        {title && <h2 className="text-lg font-semibold text-heading">{title}</h2>}
        <div className={title ? "mt-4" : ""}>{children}</div>
        <button
          onClick={onClose}
          className="mt-4 text-sm font-medium text-muted hover:text-body"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
