import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, isAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const success = await login({ email, password });
      if (success) {
        navigate(destination, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async (role: 'admin' | 'creator') => {
    try {
      setSubmitting(true);
      const success = await demoLogin(role);
      if (success) {
        navigate(destination, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Surveys
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Sign in to manage questionnaires, view analytics, and export response data.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@surveyflow.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-semibold text-[10px]">
                Or Instant Demo Sign-In
              </span>
            </div>
          </div>

          {/* Seed Accounts Demo Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 p-3 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-2xl text-left transition-all text-xs font-semibold text-emerald-800 disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Demo Account</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('creator')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-2xl text-left transition-all text-xs font-semibold text-slate-700 disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Demo Creator</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Click either demo button above for instant access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
