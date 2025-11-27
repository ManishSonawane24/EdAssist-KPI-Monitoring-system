import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const complete = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await getCurrentUser(token);
        setAuth(token, response.user);
        navigate('/');
      } catch (error) {
        navigate('/login');
      }
    };
    complete();
  }, [navigate, params, setAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 text-sm">Completing secure sign-in...</p>
    </div>
  );
}

