import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileApi";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Spinner from "../../../components/ui/Spinner";

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getProfile();
        setForm({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          email: profile.email || "",
        });
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await updateProfile({ full_name: form.full_name, phone: form.phone });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-heading">Profile</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Email" value={form.email} disabled />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {authUser?.role && (
            <div>
              <p className="text-sm text-muted">Role</p>
              <p className="font-medium text-heading">{authUser.role}</p>
            </div>
          )}
          {message && <div className="text-sm text-green-600">{message}</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" loading={submitting}>Save changes</Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
