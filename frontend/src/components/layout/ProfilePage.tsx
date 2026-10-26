import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  UserRound,
  Pencil,
  X,
} from "lucide-react";

interface ProfilePageProps {
  name: string;
  email: string;
  role: string;
  phone?: string;
  onBack: () => void;
  onLogout: () => void | Promise<void>;
  onSave?: (profile: {
    name: string;
    role: string;
    phone: string;
  }) => void | Promise<void>;
}

export default function ProfilePage({
  name,
  email,
  role,
  phone = "",
  onBack,
  onLogout,
  onSave,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name, role, phone });

  const initials = (form.name || email)
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm({ name, role, phone });
    setError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSave?.({
        name: form.name.trim(),
        role: form.role.trim(),
        phone: form.phone.trim(),
      });
      setIsEditing(false);
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  const detailLabelClass =
    "flex items-center gap-2 text-sm font-medium text-slate-500";

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        {/* Page heading */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Account / Profile
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage your personal information and account details.
          </p>
        </header>

        {/* Profile overview */}
        <section className="mb-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-sm">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-slate-900">
              {form.name || "Your name"}
            </h2>
            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {form.role || "Member"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Pencil size={16} />
                  Edit profile
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={16} />
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Basic information */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Basic information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your personal and workspace account details.
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mx-5 mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-7"
            >
              {error}
            </p>
          )}

          <dl className="divide-y divide-slate-100 px-5 sm:px-7">
            {/* Full name */}
            <div className="grid gap-2 py-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
              <dt className={detailLabelClass}>
                <UserRound size={16} />
                Full name
              </dt>
              <dd>
                {isEditing ? (
                  <input
                    className={inputClass}
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-800">
                    {name}
                  </span>
                )}
              </dd>
            </div>

            {/* Role */}
            <div className="grid gap-2 py-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
              <dt className={detailLabelClass}>
                <BriefcaseBusiness size={16} />
                Workspace role
              </dt>
              <dd>
                {isEditing ? (
                  <input
                    className={inputClass}
                    type="text"
                    value={form.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="Enter your role"
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-800">
                    {role}
                  </span>
                )}
              </dd>
            </div>

            {/* Locked email */}
            <div className="grid gap-2 py-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
              <dt className={detailLabelClass}>
                <Mail size={16} />
                Email address
              </dt>
              <dd className="flex flex-wrap items-center gap-3">
                <span className="break-all text-sm font-medium text-slate-700">
                  {email}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                  <LockKeyhole size={13} />
                  Locked
                </span>
              </dd>
            </div>

            {/* Phone */}
            <div className="grid gap-2 py-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
              <dt className={detailLabelClass}>
                <Phone size={16} />
                Phone number
              </dt>
              <dd>
                {isEditing ? (
                  <input
                    className={inputClass}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                ) : (
                  <span
                    className={
                      phone
                        ? "text-sm font-medium text-slate-800"
                        : "text-sm text-slate-400"
                    }
                  >
                    {phone || "Not provided"}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {isEditing && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
              <p className="text-xs leading-5 text-slate-500">
                Your email address cannot be edited here. Contact your
                administrator if you need to change it.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}