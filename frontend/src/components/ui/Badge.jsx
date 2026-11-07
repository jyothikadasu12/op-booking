const toneMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-600",
  neutral: "bg-slate-100 text-slate-600",
};

const Badge = ({ children, tone = "neutral", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      toneMap[tone] || toneMap.neutral
    } ${className}`}
  >
    {children}
  </span>
);

export default Badge;
