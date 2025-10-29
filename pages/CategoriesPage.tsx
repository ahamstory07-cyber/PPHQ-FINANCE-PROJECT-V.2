import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Category, TransactionType } from '../types';
import { EditIcon, DeleteIcon } from '../constants';

const CategoryModal = ({ isOpen, onClose, onSave, categoryToEdit }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Omit<Category, 'id'>) => void;
    categoryToEdit: Category | null;
}) => {
    const [formData, setFormData] = useState({
        name: '',
        type: TransactionType.Income,
    });

    useEffect(() => {
        if (isOpen) {
            if (categoryToEdit) {
                setFormData({
                    name: categoryToEdit.name,
                    type: categoryToEdit.type,
                });
            } else {
                setFormData({
                    name: '',
                    type: TransactionType.Income,
                });
            }
        }
    }, [categoryToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Nama kategori tidak boleh kosong.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{categoryToEdit ? 'Ubah' : 'Tambah'} Kategori</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Donasi Rutin" className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipe</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                            <option value={TransactionType.Income}>Pemasukan</option>
                            <option value={TransactionType.Expense}>Pengeluaran</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoriesPage = () => {
    const { categories, transactions, addCategory, updateCategory, deleteCategory } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleOpenModal = (category: Category | null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveCategory = (data: Omit<Category, 'id'>) => {
        if (editingCategory) {
            updateCategory({ ...editingCategory, ...data });
        } else {
            addCategory(data);
        }
        handleCloseModal();
    };

    const handleDeleteCategory = (categoryId: string) => {
        const categoryToDelete = categories.find(c => c.id === categoryId);
        if (!categoryToDelete) return;

        const isCategoryInUse = transactions.some(t => t.category === categoryToDelete.name);

        if (isCategoryInUse) {
            alert(`Kategori "${categoryToDelete.name}" tidak dapat dihapus karena sedang digunakan dalam transaksi.`);
            return;
        }

        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete.name}"?`)) {
            deleteCategory(categoryId);
        }
    };

    return (
        <>
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-text-primary">Manajemen Kategori</h1>
                    <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        Tambah Kategori
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Kategori</th>
                                <th scope="col" className="px-6 py-3">Tipe</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(c => (
                                <tr key={c.id} className="bg-white border-b border-border hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-text-primary">{c.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            c.type === TransactionType.Income
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {c.type === TransactionType.Income ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleOpenModal(c)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:text-red-800"><DeleteIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCategory}
                categoryToEdit={editingCategory}
            />
        </>
    );
};

export default CategoriesPage;