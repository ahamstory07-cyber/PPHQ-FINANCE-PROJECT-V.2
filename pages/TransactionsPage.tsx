import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionNature, TransactionType, Role } from '../types';
import { EditIcon, DeleteIcon, SearchIcon, ExportIcon } from '../constants';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <div className="flex flex-col items-center text-center">
                     <div className="p-3 rounded-full bg-red-100 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <p className="text-text-secondary mt-2 mb-6">{message}</p>
                    <div className="flex justify-center gap-3 w-full">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">
                            Batal
                        </button>
                        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TransactionModal = ({ isOpen, onClose, onSave, transactionToEdit, type, nature }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'createdBy' | 'lastEditedBy'>) => void;
    transactionToEdit: Transaction | null;
    type: TransactionType;
    nature?: TransactionNature;
}) => {
    const { branches, categories, currentUser, addCategory, deleteCategory, allTransactions } = useAppContext();
    const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'createdBy' | 'lastEditedBy'>>({
        date: new Date().toISOString().split('T')[0],
        branchId: currentUser?.role === 'Admin' ? (branches[0]?.id || '') : (currentUser?.branchId || ''),
        category: '',
        description: '',
        amount: 0,
        type: type,
        nature: nature || TransactionNature.Money,
    });
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsAddingCategory(false);
            setNewCategoryName('');

            if (transactionToEdit) {
                setFormData({
                    date: transactionToEdit.date,
                    branchId: transactionToEdit.branchId,
                    category: transactionToEdit.category,
                    // FIX: Corrected typo from transactionToedit to transactionToEdit.
                    description: transactionToEdit.description,
                    amount: transactionToEdit.amount,
                    type: transactionToEdit.type,
                    nature: transactionToEdit.nature,
                });
            } else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    branchId: currentUser?.role === 'Admin' ? (branches[0]?.id || '') : (currentUser?.branchId || ''),
                    category: '',
                    description: '',
                    amount: 0,
                    type: type,
                    nature: nature || TransactionNature.Money,
                });
            }
        }
    }, [transactionToEdit, isOpen, type, nature, branches, currentUser]);

    if (!isOpen) return null;
    
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSaveNewCategory = () => {
        if (newCategoryName.trim() === '') {
            alert('Nama kategori tidak boleh kosong.');
            return;
        }
        const newCategoryData = {
            name: newCategoryName,
            type: type,
        };
        addCategory(newCategoryData);
        setFormData(prev => ({ ...prev, category: newCategoryName }));
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    const handleDeleteSelectedCategory = () => {
        const categoryName = formData.category;
        if (!categoryName) {
            alert('Silakan pilih kategori yang ingin dihapus.');
            return;
        }

        const categoryToDelete = categories.find(c => c.name === categoryName && c.type === type);
        if (!categoryToDelete) {
            alert('Kategori tidak ditemukan.');
            return;
        }

        const isCategoryInUse = allTransactions.some(t => t.category === categoryToDelete.name);
        if (isCategoryInUse) {
            alert(`Kategori "${categoryToDelete.name}" tidak dapat dihapus karena sedang digunakan dalam transaksi.`);
            return;
        }

        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete.name}"?`)) {
            deleteCategory(categoryToDelete.id);
            setFormData(prev => ({ ...prev, category: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.branchId || !formData.category || (nature === TransactionNature.Money && formData.amount <= 0)) {
            alert('Silakan isi semua field yang wajib diisi.');
            return;
        }
        onSave(formData);
    };
    
    const relevantCategories = categories.filter(c => c.type === type);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-text-primary">{transactionToEdit ? 'Ubah' : 'Tambah'} Transaksi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputStyle}/>
                    </div>
                    {currentUser?.role === 'Admin' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Cabang</label>
                            <select name="branchId" value={formData.branchId} onChange={handleChange} className={`${inputStyle} bg-white`}>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori</label>
                        {isAddingCategory ? (
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Nama Kategori Baru"
                                    className="flex-1 block w-full px-3 py-2 border border-slate-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
                                />
                                <button type="button" onClick={handleSaveNewCategory} className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark font-semibold">Simpan</button>
                                <button type="button" onClick={() => setIsAddingCategory(false)} className="ml-2 px-3 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Batal</button>
                            </div>
                        ) : (
                            <div className="mt-1 flex items-center gap-2">
                                <select name="category" value={formData.category} onChange={handleChange} className={`${inputStyle} bg-white`}>
                                    <option value="">Pilih Kategori</option>
                                    {relevantCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                {currentUser?.role === Role.Admin && (
                                    <>
                                        <button type="button" onClick={() => setIsAddingCategory(true)} title="Tambah Kategori Baru" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button type="button" onClick={handleDeleteSelectedCategory} title="Hapus Kategori Terpilih" className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors">
                                            <DeleteIcon className="w-5 h-5 text-red-600"/>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsi transaksi" className={inputStyle}/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0" min="0" className={inputStyle}/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TransactionsPage = ({ type, nature = TransactionNature.Money }: { type: TransactionType, nature?: TransactionNature }) => {
    const { transactions, branches, addTransaction, updateTransaction, deleteTransaction, currentUser } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    useEffect(() => {
        setSearchTerm('');
    }, [type, nature]);

    const pageTitle = type === TransactionType.Income ? 'Pemasukan Uang' : 'Pengeluaran';

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => t.type === type && t.nature === nature)
            .filter(t => 
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (currentUser?.role === Role.Admin && branches.find(b => b.id === t.branchId)?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, type, nature, searchTerm, branches, currentUser]);

    const handleOpenModal = (transaction: Transaction | null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'createdBy' | 'lastEditedBy'>) => {
        if (editingTransaction) {
            updateTransaction({ ...editingTransaction, ...data });
        } else {
            addTransaction(data);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (transactionId: string) => {
        setTransactionToDelete(transactionId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete);
        }
        setIsConfirmModalOpen(false);
        setTransactionToDelete(null);
    };
    
    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'N/A';
    
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            alert('Tidak ada data untuk diekspor.');
            return;
        }
    
        const headers = ['Tanggal'];
        if (currentUser?.role === Role.Admin) {
            headers.push('Cabang');
        }
        headers.push('Kategori', 'Deskripsi', 'Jumlah (Rp)');
    
        const toCsvField = (field: string | number | undefined) => {
            const str = String(field ?? '');
            if (str.search(/("|,|\n)/g) >= 0) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
    
        const csvRows = [
            headers.join(','), // Header row
            ...filteredTransactions.map(t => {
                const rowData = [
                    toCsvField(new Date(t.date).toLocaleDateString('id-ID')),
                    ...(currentUser?.role === Role.Admin ? [toCsvField(getBranchName(t.branchId))] : []),
                    toCsvField(t.category),
                    toCsvField(t.description),
                    toCsvField(t.amount)
                ];
                return rowData.join(',');
            })
        ];
    
        const csvContent = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type.toLowerCase()}-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm border border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-text-primary">{pageTitle}</h1>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                         <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Cari..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                        </div>
                        <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-text-secondary bg-white rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap text-sm font-semibold">
                            <ExportIcon className="w-5 h-5" />
                            <span>Ekspor</span>
                        </button>
                        <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap font-semibold text-sm">
                            Tambah
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                                {currentUser?.role === Role.Admin && <th scope="col" className="px-4 py-3 font-semibold">Cabang</th>}
                                <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Deskripsi</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-right">Jumlah</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                    {currentUser?.role === Role.Admin && <td className="px-4 py-3 font-medium text-text-primary">{getBranchName(t.branchId)}</td>}
                                    <td className="px-4 py-3">{t.category}</td>
                                    <td className="px-4 py-3">{t.description}</td>
                                    <td className={`px-4 py-3 text-right font-semibold ${t.type === TransactionType.Income ? 'text-green-600' : 'text-red-600'}`}>
                                        Rp{t.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleOpenModal(t)} className="text-blue-600 hover:text-blue-800 p-1"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDeleteRequest(t.id)} className="text-red-600 hover:text-red-800 p-1"><DeleteIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                              {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={currentUser?.role === Role.Admin ? 6 : 5} className="text-center py-8 text-text-secondary">
                                        Tidak ada transaksi ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTransaction}
                transactionToEdit={editingTransaction}
                type={type}
                nature={nature}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat diurungkan."
            />
        </>
    );
};

export default TransactionsPage;