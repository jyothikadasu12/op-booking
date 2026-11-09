
const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
  secondary:
    "bg-violet-600 text-white hover:bg-violet-700 border border-violet-600",
  outline:
    "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50",
  ghost:
    "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-red-600",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {children}
    </button>
  );
};

export default Button;
