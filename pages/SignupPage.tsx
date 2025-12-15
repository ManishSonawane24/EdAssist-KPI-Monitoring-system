import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, getGoogleOAuthUrl } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await register(form);
      setAuth(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create an account</h1>
          <p className="text-slate-500 dark:text-slate-300 text-sm">Launch your analytics command center</p>
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 dark:text-slate-300 uppercase font-semibold">Or</span>
          <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <button
          onClick={() => window.location.assign(getGoogleOAuthUrl())}
          className="w-full border border-slate-200 dark:border-slate-700 py-2.5 rounded-lg font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
        >
          <span>Continue with Google</span>
        </button>

        <p className="text-sm text-center text-slate-500 dark:text-slate-300">
          Already onboard? <Link to="/login" className="text-brand-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

