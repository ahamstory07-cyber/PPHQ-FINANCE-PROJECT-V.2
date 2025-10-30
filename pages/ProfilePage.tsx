
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserIcon } from '../constants';

const ProfilePage = () => {
    const { currentUser, updateUser } = useAppContext();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Kata sandi baru dan konfirmasi tidak cocok.');
            return;
        }

        if (currentUser) {
            const updatedUser = {
                ...currentUser,
                name,
                email,
                password: password ? password : currentUser.password,
            };
            updateUser(updatedUser);
            setSuccess('Profil berhasil diperbarui!');
            setPassword('');
            setConfirmPassword('');
        }
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    const inputStyle = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm";

    return (
        <div className="max-w-2xl mx-auto">
             <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                         <UserIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Profil Saya</h1>
                        <p className="text-text-secondary">Kelola informasi profil Anda di sini.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-text-primary">
                          Nama Lengkap
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputStyle}
                          required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-text-primary">
                          Alamat Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputStyle}
                          required
                        />
                    </div>

                    <div className="border-t border-border pt-5 space-y-5">
                         <div>
                            <label htmlFor="password" className="text-sm font-medium text-text-primary">
                              Kata Sandi Baru (opsional)
                            </label>
                            <input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={inputStyle}
                              placeholder="Biarkan kosong jika tidak diubah"
                            />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
                              Konfirmasi Kata Sandi Baru
                            </label>
                            <input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={inputStyle}
                              placeholder="Ketik ulang kata sandi baru"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 rounded-md bg-red-50 p-3 border border-red-200">{error}</p>}
                    {success && <p className="text-sm text-green-600 rounded-md bg-green-50 p-3 border border-green-200">{success}</p>}

                    <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                        >
                          Simpan Perubahan
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
};

export default ProfilePage;
