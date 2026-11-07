import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/providers", label: "Providers" },
  { to: "/admin/availability", label: "Availability" },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-white lg:block">
      <div className="px-6 py-5">
        <p className="text-lg font-bold text-heading">Admin Panel</p>
        <p className="mt-1 text-sm text-muted">{user?.full_name}</p>
      </div>
      <nav className="space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-body hover:bg-surface-muted"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
