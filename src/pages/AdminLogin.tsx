import { useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdminAuthenticated } from "../lib/adminAuth";
import { useAdminLogin } from "../hooks/useAdminLogin";
import Logo from "../assets/logo.webp";
import BG1 from "../assets/bg-1.webp";

export default function AdminLogin() {
  const { form, submitting, onChange, onSubmit, redirectTo } = useAdminLogin();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  if (isAdminAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div
      className="min-h-screen bg1 bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${BG1})` }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-4xl border border-white/20 bg-white/15 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] z-50">

          {/* LEFT PANEL */}
          <div className="hidden bg-linear-to-br from-blue-950/90 via-blue-800/80 to-cyan-500/70 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs tracking-[0.25em] uppercase text-blue-100">
                Ariel Assessment
              </div>

              <img src={Logo} alt="logo" className="max-w-50 mt-5" />

              <h1 className="mt-6 text-4xl font-bold leading-tight">
                Create tests and review candidate submissions.
              </h1>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white/92 p-6 sm:p-10">
            <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">

              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                  Admin Login
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  Welcome Admin
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access the HR dashboard and candidate assessment reports.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">

                {/* EMAIL */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Login email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="username"
                    placeholder="Enter admin email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* PASSWORD WITH TOGGLE */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? (
                        /* Eye Off */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7a17.28 17.28 0 014.53-5.53M9.88 9.88A3 3 0 1114.12 14.12M6.1 6.1l11.8 11.8"
                          />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5
                   c4.477 0 8.268 2.943 9.542 7
                   -1.274 4.057-5.065 7-9.542 7
                   -4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full cursor-pointer rounded-2xl bg-linear-to-r from-blue-500 via-blue-700 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}