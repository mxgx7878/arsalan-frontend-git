import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const res = err.response;
      if (res?.status === 401 || res?.status === 400) {
        const apiErrors = res.data?.error || {};
        setErrors(apiErrors);
        toast.error(apiErrors.email?.[0] || "Invalid credentials");
      } else if (res?.status === 403) {
        toast.error(res.data?.message || "Account inactive");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(251,191,36,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Decorative truck silhouette line */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/5 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo mark */}
          <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center mb-8 shadow-lg shadow-amber-500/20">
            <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 18.5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM9 18.5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM17 9.5V12h4.47L19.5 9.5H17z"/>
            </svg>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight">
            ILAYS&SONS
            <span className="block text-amber-500 mt-1">TRANSPORT</span>
          </h1>

          <div className="w-16 h-1 bg-amber-500 rounded mt-6 mb-6" />

          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            Truck & Trailer Supplier
          </p>
          <p className="text-slate-400 text-base mt-1">
            Specialist in Container Service
          </p>

          <div className="mt-12 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Service</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Reliable</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-white">Fleet</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Managed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <svg className="w-7 h-7 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 18.5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM9 18.5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM17 9.5V12h4.47L19.5 9.5H17z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              ILAYS&SONS <span className="text-amber-500">TRANSPORT</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Specialist in Container Service</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to manage your fleet</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-800 focus:ring-amber-500/30 focus:border-amber-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-800 focus:ring-amber-500/30 focus:border-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-8">
            &copy; {new Date().getFullYear()} Ilays&Sons Transport. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
