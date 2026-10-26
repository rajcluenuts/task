
import { useState } from "react";
import type { FormEvent } from "react";
import type { AuthUser } from "../../types/auth";

type AuthMode = "login" | "signup";

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

interface AuthResponse {
  message?: string;
  user?: AuthUser;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ?? "/api";

      const endpoint =
        mode === "login" ? "/auth/login" : "/auth/signup";

      const body =
        mode === "login"
          ? { email, password, rememberMe }
          : { name, email, password };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            (mode === "login"
              ? "Unable to sign in."
              : "Unable to create account.")
        );
      }

      if (mode === "signup") {
        setError(
          "Account created successfully. You can now sign in."
        );
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        if (!data.user) {
          throw new Error("The server returned an invalid sign-in response.");
        }

        onLogin(data.user);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page min-h-screen bg-white md:grid md:grid-cols-2">
      {/* Simple left-side illustration panel */}
      <section className="hidden flex-col justify-between bg-violet-50 p-10 lg:p-14 md:flex">
        <a
          href="/"
          className="flex items-center gap-3 text-xl font-bold text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
            ✓
          </span>
          TaskFlow
        </a>

        <div className="mx-auto w-full max-w-md py-10">
          <p className="text-xs font-bold tracking-[0.2em] text-violet-600">
            YOUR WORKSPACE, SIMPLIFIED
          </p>

          <h1 className="auth-hero-title mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 lg:text-5xl">
            Less busywork.
            <br />
            More progress.
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-7 text-gray-500">
            Keep your tasks organized and focus on what matters most.
          </p>

          {/* Compact task illustration — decorative, not live dashboard data */}
          <div
            aria-label="Illustration of a task list"
            className="mt-8 rounded-2xl border border-violet-100 bg-white p-5 shadow-xl shadow-violet-900/5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400">
                  TODAY'S TASKS
                </p>
                <h2 className="auth-illustration-title mt-1 text-lg font-semibold text-gray-900">
                  Your daily focus
                </h2>
              </div>
              <span className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-600">
                Today
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-violet-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl text-violet-600">
                ✓
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  One step at a time
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Stay focused, keep moving, and make progress every day.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs">
              <span className="text-gray-500">Your progress, at a glance</span>
              <span className="font-semibold text-violet-600">1 of 3</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-1/3 rounded-full bg-violet-600" />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Your work, one task at a time.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-12">
        <div className="mb-12 flex w-full max-w-sm items-center gap-3 md:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">
            ✓
          </span>
          <span className="text-xl font-bold text-gray-900">
            TaskFlow
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] text-violet-600">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </p>

            <h2 className="auth-form-title mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {mode === "login"
                ? "Enter your details to sign in to your account."
                : "Enter your details to get started with TaskFlow."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                {mode === "login" && (
                  <a
                    href="/forgot-password"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Forgot password?
                  </a>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-16 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {mode === "signup" && (
                <p className="mt-2 text-xs text-gray-400">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            )}

            {mode === "login" && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                />
                Remember me
              </label>
            )}

            {error && (
              <p
                role="status"
                className={`rounded-lg px-3 py-2 text-sm ${
                  error.toLowerCase().includes("successfully")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}

              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() =>
              setError("Google sign-in has not been configured yet.")
            }
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.91c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.39 38.05 46.98 31.95 46.98 24.55Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.91 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-500">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}

            <button
              type="button"
              onClick={() =>
                switchMode(mode === "login" ? "signup" : "login")
              }
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>

          <p className="mt-12 text-center text-xs leading-5 text-gray-400">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-600">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
