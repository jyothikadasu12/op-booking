const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-heading">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;
