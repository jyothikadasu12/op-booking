const EmptyState = ({ title, description, action }) => (
  <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-12 text-center">
    <h3 className="text-lg font-semibold text-heading">{title}</h3>
    {description && <p className="mt-2 text-sm text-muted">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
