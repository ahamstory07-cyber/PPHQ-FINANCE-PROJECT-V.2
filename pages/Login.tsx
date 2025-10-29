import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Logo } from '../constants';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, users } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      navigate('/');
    } else {
      setError('Email tidak valid atau pengguna tidak aktif.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card shadow-lg rounded-xl p-8 space-y-6 border border-border">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-4 text-center text-2xl font-bold text-text-primary">
            Selamat Datang di PPHQ Finance
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Masuk untuk melanjutkan ke dasbor Anda
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-primary">
              Alamat Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
                placeholder="admin@pphq.com"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Masuk
            </button>
          </div>
        </form>
         <div className="text-center text-xs text-gray-500 pt-4 border-t border-border">
            <p className="font-semibold mb-2">Gunakan Akun Demo:</p>
            <div className="space-y-1">
            {users.filter(u => u.isActive).map(u => (
                <div key={u.id}>
                    <button onClick={() => setEmail(u.email)} className="text-primary hover:underline font-medium">{u.email}</button> 
                    <span className="text-gray-400"> ({u.role})</span>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;