
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Role } from '../types';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { gapi } from 'gapi-script';

// Google Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.655-3.397-11.127-7.962l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.993,36.61,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

// FIX: Type cast `import.meta` to `any` to access `env` without Vite's client types, resolving a TypeScript error.
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const SettingsPage = () => {
    const { currentUser, allTransactions } = useAppContext();
    const [token, setToken] = useState<string | null>(localStorage.getItem('google_access_token'));
    const [profile, setProfile] = useState<any | null>(JSON.parse(localStorage.getItem('google_profile') || 'null'));
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    useEffect(() => {
        const initClient = () => {
             gapi.client.init({
                clientId: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/spreadsheets'
             });
        };
        gapi.load('client:auth2', initClient);

        if(token) {
            fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                localStorage.setItem('google_profile', JSON.stringify(data));
            })
            .catch(err => {
                console.error("Failed to fetch profile:", err);
                handleDisconnect();
            });
        }
    }, [token]);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            setToken(codeResponse.access_token);
            localStorage.setItem('google_access_token', codeResponse.access_token);
        },
        onError: (error) => console.log('Login Failed:', error),
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    });

    const handleDisconnect = () => {
        googleLogout();
        setToken(null);
        setProfile(null);
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_profile');
        setSyncMessage('');
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncMessage('');

        if (!token) {
            setSyncMessage('Koneksi Google terputus. Harap hubungkan kembali.');
            setIsSyncing(false);
            return;
        }

        try {
            // 1. Create a new spreadsheet
            console.log("Creating spreadsheet...");
            const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: {
                        title: `PPHQ Finance - Laporan Keuangan ${new Date().toLocaleString('id-ID')}`
                    }
                })
            });

            if (!createResponse.ok) throw new Error('Failed to create spreadsheet');
            const spreadsheet = await createResponse.json();
            const spreadsheetId = spreadsheet.spreadsheetId;
            console.log(`Spreadsheet created with ID: ${spreadsheetId}`);

            // 2. Prepare data for upload
            const headers = ['ID Transaksi', 'Tanggal', 'Cabang', 'Kategori', 'Deskripsi', 'Tipe', 'Jenis', 'Jumlah', 'Dibuat Oleh'];
            const values = allTransactions.map(t => [
                t.id, t.date, t.branchId, t.category, t.description, t.type, t.nature, t.amount, t.createdBy
            ]);

            // 3. Update the spreadsheet with data
            console.log("Uploading data...");
            const updateResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [headers, ...values]
                })
            });

             if (!updateResponse.ok) throw new Error('Failed to upload data');
            
            setSyncMessage(`Sinkronisasi berhasil! Lihat di: ${spreadsheet.spreadsheetUrl}`);
        } catch (error: any) {
            console.error("Sync error:", error);
            setSyncMessage(`Gagal menyinkronkan data: ${error.message}. Mungkin perlu menghubungkan ulang akun Anda.`);
        } finally {
            setIsSyncing(false);
        }
    };

    if (currentUser?.role !== Role.Admin) {
        return (
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border text-center">
                <h1 className="text-xl font-bold text-text-primary mb-2">Akses Ditolak</h1>
                <p className="text-text-secondary">Halaman ini hanya dapat diakses oleh Admin.</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Pengaturan</h1>
                <p className="text-text-secondary mb-6">Kelola integrasi dan preferensi aplikasi Anda.</p>

                <div className="border-t border-border pt-6">
                    <h2 className="text-xl font-semibold text-text-primary">Integrasi Google Sheets</h2>
                    <p className="text-text-secondary mt-1">
                        Hubungkan akun Google Anda untuk menyinkronkan seluruh data keuangan dari semua cabang ke dalam satu Google Sheet.
                    </p>

                    <div className="mt-6 p-5 rounded-lg bg-slate-50 border border-border">
                        {profile ? (
                             <div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                     <div className="flex items-center gap-3">
                                        <img src={profile.picture} alt="profile" className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-text-primary">{profile.name}</p>
                                            <p className="text-sm text-text-secondary">{profile.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDisconnect}
                                        className="text-sm font-semibold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Putuskan
                                    </button>
                                </div>
                                <div className="mt-6 border-t border-border pt-5">
                                    <p className="text-sm text-text-secondary mb-3">Mulai sinkronisasi untuk membuat Google Sheet baru berisi data transaksi terbaru.</p>
                                     <button
                                        onClick={handleSync}
                                        disabled={isSyncing}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:bg-primary/50 disabled:cursor-not-allowed"
                                    >
                                        {isSyncing ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="font-semibold text-text-primary">Status: Tidak Terhubung</p>
                                <button
                                    onClick={() => login()}
                                    className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-border rounded-lg shadow-sm hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
                                >
                                    <GoogleIcon />
                                    <span className="font-semibold text-text-primary">Hubungkan dengan Google</span>
                                </button>
                            </div>
                        )}
                        {syncMessage && (
                            <p className={`mt-4 text-sm text-center sm:text-left p-3 rounded-md border ${syncMessage.includes('Gagal') ? 'text-red-700 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'}`}>
                                {syncMessage.startsWith('Sinkronisasi berhasil!') ? (
                                    <>
                                        Sinkronisasi berhasil! <a href={syncMessage.split('Lihat di: ')[1]} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-green-800">Lihat Google Sheet.</a>
                                    </>
                                ) : syncMessage}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;