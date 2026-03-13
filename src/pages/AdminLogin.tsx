import { Navigate } from "react-router-dom";
import { isAdminAuthenticated } from "../lib/adminAuth";
import { useAdminLogin } from "../hooks/useAdminLogin";
// import Logo from "../../public/logo.webp";

export default function AdminLogin() {
  const { form, submitting, onChange, onSubmit, redirectTo } = useAdminLogin();

  if (isAdminAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-[url(../../public/bg-1.jpg)] bg1 bg-cover bg-center px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-4xl border border-white/20 bg-white/15 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] z-50">

          <div className="hidden bg-linear-to-br from-blue-950/90 via-blue-800/80 to-cyan-500/70 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs tracking-[0.25em] uppercase text-blue-100">
                Ariel Assessment
              </div>

              {/* <img src={Logo} alt="logo" className="max-w-50 mt-5" /> */}

              <h1 className="mt-6 text-4xl font-bold leading-tight">
                create tests and review candidate submissions.
              </h1>
            </div>
          </div>

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

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>

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