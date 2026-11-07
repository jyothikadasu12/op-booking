const Select = ({
  label,
  error,
  required = false,
  className = "",
  id,
  children,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-body">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-body outline-none transition ${
          error ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
