import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, TransactionNature, Category } from '../types';
import { PencilIcon, TrashIcon } from '../constants';

interface TransactionsPageProps {
    type: TransactionType;
    nature?: TransactionNature; // Optional, defaults to Money
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ type, nature = TransactionNature.Money }) => {
    const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, currentUser } = useAppContext();
    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
    const [formState, setFormState] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
    });
    
    // Reset state when the component's key changes (via navigation)
    useEffect(() => {
        closeModal(); // Also close modal on navigation
    }, [location.pathname, location.search]); // More reliable than key

    const pageTitle = type === TransactionType.Income ? 'Pemasukan Uang' : 'Pengeluaran';
    const availableCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => t.type === type && t.nature === nature)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, type, nature]);

    const openModal = (transaction: Transaction | null = null) => {
        setCurrentTransaction(transaction);
        const initialCategory = transaction?.category || (availableCategories.length > 0 ? availableCategories[0].name : '');
        setFormState({
            date: transaction ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
            category: initialCategory,
            description: transaction ? transaction.description : '',
            amount: transaction ? transaction.amount : 0,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTransaction(null);
        setFormState({
            date: new Date().toISOString().split('T')[0],
            category: availableCategories.length > 0 ? availableCategories[0].name : '',
            description: '',
            amount: 0,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.category || !formState.description || formState.amount <= 0) {
            alert('Harap isi semua kolom dengan benar.');
            return;
        }

        const transactionData = {
            date: new Date(formState.date).toISOString(),
            branchId: currentUser!.branchId,
            category: formState.category,
            description: formState.description,
            amount: formState.amount,
            type: type,
            nature: nature,
        };

        if (currentTransaction) {
            await updateTransaction({ ...currentTransaction, ...transactionData });
        } else {
            await addTransaction(transactionData);
        }
        closeModal();
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            await deleteTransaction(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">{pageTitle}</h1>
                <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Tambah {type === TransactionType.Income ? 'Pemasukan' : 'Pengeluaran'}
                </button>
            </div>
            
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Kategori</th>
                                <th className="px-6 py-3">Deskripsi</th>
                                <th className="px-6 py-3 text-right">Jumlah</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b border-border hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4">{t.category}</td>
                                    <td className="px-6 py-4 font-medium">{t.description}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${type === TransactionType.Income ? 'text-green-600' : 'text-red-600'}`}>
                                        Rp{t.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openModal(t)} 
                                                className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                title="Edit Transaksi"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(t.id)} 
                                                className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-full transition-colors"
                                                title="Hapus Transaksi"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6">{currentTransaction ? 'Edit' : 'Tambah'} {pageTitle}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="date">Tanggal</label>
                                <input id="date" name="date" type="date" value={formState.date} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                            </div>
                             <div>
                                <label htmlFor="category">Kategori</label>
                                <select id="category" name="category" value={formState.category} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md bg-white" required>
                                    <option value="" disabled>Pilih Kategori</option>
                                    {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description">Deskripsi</label>
                                <input id="description" name="description" type="text" value={formState.description} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="amount">Jumlah</label>
                                <input id="amount" name="amount" type="number" value={formState.amount} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                            </div>
                             <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;