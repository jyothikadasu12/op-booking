const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-secondary text-white hover:bg-violet-600",
  outline: "border border-primary text-primary hover:bg-primary-light",
  ghost: "text-primary hover:bg-primary-light",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
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
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
      variants[variant] || variants.primary
    } ${sizes[size] || sizes.md} ${className}`}
    {...props}
  >
    {loading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
    )}
    {children}
  </button>
);

export default Button;
