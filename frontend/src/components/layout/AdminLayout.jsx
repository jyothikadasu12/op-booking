import { Link, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="border-b border-border bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-sm text-muted">Administrator workspace</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-body">{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-body hover:border-primary hover:text-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
