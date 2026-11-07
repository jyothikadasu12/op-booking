const Card = ({ children, className = "", padding = true }) => (
  <div className={`rounded-2xl bg-surface shadow-sm ${padding ? "p-6" : ""} ${className}`}>
    {children}
  </div>
);

export default Card;
