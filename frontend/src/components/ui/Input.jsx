
const Input = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-body">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-heading outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
