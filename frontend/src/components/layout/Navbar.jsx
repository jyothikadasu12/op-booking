import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to={user ? "/dashboard" : "/"} className="text-xl font-bold text-heading">
          Service Booking
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-body md:flex">
          {user && !isAdmin && (
            <>
              <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
              <Link to="/services" className="hover:text-primary">Services</Link>
              <Link to="/availability" className="hover:text-primary">Availability</Link>
            </>
          )}
          {user && isAdmin && <Link to="/admin" className="hover:text-primary">Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted sm:block">{user.full_name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-body hover:border-primary hover:text-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-body hover:text-primary">Log in</Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
