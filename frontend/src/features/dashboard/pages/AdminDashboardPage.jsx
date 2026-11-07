import { useAuth } from "../../../hooks/useAuth";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background px-6 py-8 text-body">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between rounded-2xl bg-surface p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-heading">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted">
              Signed in as {user?.full_name || "administrator"}.
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
