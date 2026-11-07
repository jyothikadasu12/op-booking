const Input = ({
  label,
  error,
  required = false,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-body">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-body outline-none transition ${
          error ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
