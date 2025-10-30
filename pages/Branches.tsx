import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { EditIcon, DeleteIcon } from '../constants';
import { Branch, User, Role } from '../types';

type EditingData = {
    branch: Branch;
    user: User | undefined;
}

const ManagementModal = ({ isOpen, onClose, onSave, data, isAdding }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
    data: EditingData | null;
    isAdding: boolean;
}) => {
    const [formData, setFormData] = useState({
        branchName: '',
        location: '',
        userName: '',
        email: '',
        password: '',
        isActive: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (isAdding) {
                setFormData({
                    branchName: '',
                    location: '',
                    userName: '',
                    email: '',
                    password: '',
                    isActive: true,
                });
            } else if (data) {
                setFormData({
                    branchName: data.branch.name,
                    location: data.branch.location,
                    userName: data.user?.name || '',
                    email: data.user?.email || '',
                    password: '', // Never pre-fill password for security
                    isActive: data.user?.isActive ?? true,
                });
            }
        }
    }, [data, isAdding, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.branchName || !formData.location || !formData.userName || !formData.email) {
            alert('Harap isi semua field yang diperlukan.');
            return;
        }
        if(isAdding && !formData.password) {
            alert('Kata sandi wajib diisi untuk pengguna baru.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isAdding ? 'Tambah Cabang & Pengguna Baru' : 'Ubah Data Cabang & Pengguna'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2">Data Cabang</legend>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Cabang</label>
                                <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required/>
                            </div>
                        </div>
                    </fieldset>
                    
                    {(isAdding || data?.user) && (
                         <fieldset className="border p-4 rounded-md">
                            <legend className="text-lg font-semibold px-2">Data Pengguna</legend>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Pengguna</label>
                                    <input type="text" name="userName" value={formData.userName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{isAdding ? 'Kata Sandi' : 'Kata Sandi Baru (opsional)'}</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isAdding ? 'Masukkan kata sandi' : 'Biarkan kosong jika tidak diubah'} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"/>
                                    <label className="ml-2 block text-sm text-gray-900">Akun Aktif</label>
                                </div>
                            </div>
                        </fieldset>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{isAdding ? 'Simpan Cabang' : 'Simpan Perubahan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, branchName }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    branchName: string;
}) => {
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
                    <h2 className="text-xl font-bold text-text-primary">Konfirmasi Hapus</h2>
                    <p className="text-text-secondary mt-2 mb-6">
                        Apakah Anda yakin ingin menghapus <strong>{branchName}</strong> beserta akun penggunanya? Tindakan ini tidak dapat diurungkan.
                    </p>
                    <div className="flex justify-center gap-3 w-full">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold">
                            Batal
                        </button>
                        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Branches = () => {
    const { branches, users, addBranch, updateBranch, addUser, updateUser, deleteBranchAndUser } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingData, setEditingData] = useState<EditingData | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

    const getBranchUser = (branchId: string) => {
        return users.find(u => u.branchId === branchId);
    };
    
    const handleOpenEditModal = (branch: Branch) => {
        const user = getBranchUser(branch.id);
        setIsAdding(false);
        setEditingData({ branch, user });
        setIsModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setIsAdding(true);
        setEditingData(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingData(null);
        setIsAdding(false);
    };

    const handleDeleteRequest = (branch: Branch) => {
        setBranchToDelete(branch);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (branchToDelete) {
            deleteBranchAndUser(branchToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setBranchToDelete(null);
    };

    const handleSave = (formData: any) => {
        if (isAdding) {
            const newBranchData: Omit<Branch, 'id'> = {
                name: formData.branchName,
                location: formData.location,
                pic: formData.userName,
                isActive: formData.isActive,
            };
            const newBranch = addBranch(newBranchData);

            const newUserData: Omit<User, 'id' | 'lastLogin'> = {
                name: formData.userName,
                email: formData.email,
                password: formData.password,
                role: Role.BranchUser,
                branchId: newBranch.id,
                isActive: formData.isActive,
            };
            addUser(newUserData);

        } else if (editingData) {
            const updatedBranch: Branch = {
                ...editingData.branch,
                name: formData.branchName,
                location: formData.location,
                pic: formData.userName,
                isActive: formData.isActive,
            };
            updateBranch(updatedBranch);

            if (editingData.user) {
                const updatedUser: User = {
                    ...editingData.user,
                    name: formData.userName,
                    email: formData.email,
                    isActive: formData.isActive,
                    password: formData.password ? formData.password : editingData.user.password,
                };
                updateUser(updatedUser);
            }
        }
        handleCloseModal();
    };

    return (
        <>
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-text-primary">Manajemen Cabang & Pengguna</h1>
                    <button onClick={handleOpenAddModal} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        Tambah Cabang
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Cabang</th>
                                <th scope="col" className="px-6 py-3">Lokasi</th>
                                <th scope="col" className="px-6 py-3">Nama Pengguna</th>
                                <th scope="col" className="px-6 py-3">Kata Sandi</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.map(b => {
                                const user = getBranchUser(b.id);
                                const status = user ? user.isActive : b.isActive;
                                
                                return (
                                    <tr key={b.id} className="bg-white border-b border-border hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-text-primary">{b.name}</td>
                                        <td className="px-6 py-4">{b.location}</td>
                                        <td className="px-6 py-4">{user?.name || <span className="text-xs italic text-gray-400">Belum ada pengguna</span>}</td>
                                        <td className="px-6 py-4 font-mono tracking-widest">{user?.password ? '••••••••' : '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {status ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleOpenEditModal(b)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => handleDeleteRequest(b)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100">
                                                    <DeleteIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <ManagementModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                data={editingData}
                isAdding={isAdding}
            />
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                branchName={branchToDelete?.name || ''}
            />
        </>
    );
};

export default Branches;