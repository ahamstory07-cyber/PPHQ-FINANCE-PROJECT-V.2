import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionNature, TransactionType } from '../types';
import { SearchIcon, GiftIcon } from '../constants';

const BranchTransactions = () => {
    const { branchId } = useParams<{ branchId: string }>();
    const { allTransactions, branches, users } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const branch = useMemo(() => branches.find(b => b.id === branchId), [branches, branchId]);

    const filteredTransactions = useMemo(() => {
        if (!branchId) return [];
        return allTransactions
            .filter(t => t.branchId === branchId)
            .filter(t => 
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allTransactions, branchId, searchTerm]);

    if (!branch) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-red-600">Cabang Tidak Ditemukan</h1>
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">Kembali ke Dasbor</Link>
            </div>
        );
    }
    
    return (
        <>
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Detail Transaksi: {branch.name}</h1>
                        <p className="text-text-secondary">Menampilkan semua riwayat transaksi untuk cabang ini.</p>
                    </div>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Tanggal</th>
                                <th scope="col" className="px-6 py-3">Kategori</th>
                                <th scope="col" className="px-6 py-3">Deskripsi</th>
                                <th scope="col" className="px-6 py-3 text-right">Jumlah / Barang</th>
                                <th scope="col" className="px-6 py-3 text-center">Tipe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="bg-white border-b border-border hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4">{t.category}</td>
                                    <td className="px-6 py-4 font-medium text-text-primary">{t.description}</td>
                                    <td className="px-6 py-4 text-right font-semibold">
                                        {t.nature === TransactionNature.Money ? (
                                            <span className={t.type === TransactionType.Income ? 'text-green-600' : 'text-red-600'}>
                                                Rp{t.amount.toLocaleString('id-ID')}
                                            </span>
                                        ) : (
                                             <div className="flex items-center justify-end gap-2 text-gray-600">
                                                <GiftIcon className="w-4 h-4" />
                                                <span>Barang</span>
                                             </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            t.type === TransactionType.Income
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {t.type === TransactionType.Income ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredTransactions.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-text-secondary">Tidak ada transaksi yang cocok dengan pencarian Anda.</p>
                    </div>
                 )}
            </div>
        </>
    );
};

export default BranchTransactions;
