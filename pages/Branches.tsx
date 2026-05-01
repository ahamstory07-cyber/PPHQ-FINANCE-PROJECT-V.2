import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Branch, User, Role } from '../types';

const Branches = () => {
    const { branches, users, addBranch, updateBranch, deleteBranch, addUser, updateUserByAdmin, deleteUser } = useAppContext();
    
    // State for Branch Modal
    const [isBranchModalOpen, setBranchModalOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
    const [branchName, setBranchName] = useState('');
    const [branchLocation, setBranchLocation] = useState('');

    // State for User Modal
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userBranchId, setUserBranchId] = useState('');
    const [userIsActive, setUserIsActive] = useState(true);

    // Branch Modal Logic
    const openBranchModal = (branch: Branch | null = null) => {
        setCurrentBranch(branch);
        setBranchName(branch?.name || '');
        setBranchLocation(branch?.location || '');
        setBranchModalOpen(true);
    };
    const closeBranchModal = () => setBranchModalOpen(false);

    const handleBranchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentBranch) {
            await updateBranch({ ...currentBranch, name: branchName, location: branchLocation });
        } else {
            await addBranch({ name: branchName, location: branchLocation });
        }
        closeBranchModal();
    };

    const handleBranchDelete = async (id: string) => {
        if (window.confirm('Yakin hapus cabang ini? Semua pengguna dan transaksi yang terkait dengan cabang ini juga akan dihapus.')) {
            await deleteBranch(id);
        }
    };

    // User Modal Logic
    const openUserModal = (user: User | null = null) => {
        setCurrentUser(user);
        setUserName(user?.name || '');
        setUserEmail(user?.email || '');
        setUserPassword(''); // Always clear password field
        setUserBranchId(user?.branchId || (branches.length > 0 ? branches[0].id : ''));
        setUserIsActive(user?.isActive ?? true);
        setUserModalOpen(true);
    };
    const closeUserModal = () => setUserModalOpen(false);
    
    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData = {
            name: userName,
            email: userEmail,
            role: Role.BranchUser,
            branchId: userBranchId,
            isActive: userIsActive,
            ...(userPassword && { password: userPassword })
        };

        if (currentUser) {
            await updateUserByAdmin({ ...currentUser, ...userData });
        } else {
            if (!userPassword) {
                alert("Password is required for new users.");
                return;
            }
            await addUser({ ...userData, password: userPassword });
        }
        closeUserModal();
    };
    
    const handleUserDelete = async (id: string) => {
        if (window.confirm('Yakin hapus pengguna ini?')) {
            await deleteUser(id);
        }
    };


    const getBranchUsers = (branchId: string) => users.filter(u => u.branchId === branchId && u.role === Role.BranchUser);

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-text-primary">Manajemen Cabang</h1>
                    <button onClick={() => openBranchModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Tambah Cabang</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map(branch => (
                        <div key={branch.id} className="bg-card p-5 rounded-xl border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary">{branch.name}</h3>
                                    <p className="text-sm text-text-secondary">{branch.location}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openBranchModal(branch)} className="text-sm font-medium text-primary hover:underline">Edit</button>
                                    <button onClick={() => handleBranchDelete(branch.id)} className="text-sm font-medium text-red-600 hover:underline">Hapus</button>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-sm mb-2">Pengguna Terdaftar:</h4>
                                <ul className="space-y-2">
                                    {getBranchUsers(branch.id).map(user => (
                                         <li key={user.id} className="flex justify-between items-center text-sm">
                                            <span>{user.name} ({user.email})</span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </li>
                                    ))}
                                    {getBranchUsers(branch.id).length === 0 && <p className="text-xs text-text-secondary">Belum ada pengguna.</p>}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-text-primary">Manajemen Pengguna</h1>
                    <button onClick={() => openUserModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Tambah Pengguna</button>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Cabang</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role !== Role.Admin).map(user => (
                                <tr key={user.id} className="border-b border-border hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">{branches.find(b => b.id === user.branchId)?.name || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                         <span className={`px-2 py-0.5 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openUserModal(user)} className="font-medium text-primary hover:underline">Edit</button>
                                        <button onClick={() => handleUserDelete(user.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Branch Modal */}
            {isBranchModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{currentBranch ? 'Edit' : 'Tambah'} Cabang</h2>
                        <form onSubmit={handleBranchSubmit} className="space-y-4">
                            <div>
                                <label>Nama Cabang</label>
                                <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" required />
                            </div>
                             <div>
                                <label>Lokasi</label>
                                <input type="text" value={branchLocation} onChange={e => setBranchLocation(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeBranchModal} className="px-4 py-2 bg-slate-200 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-6">{currentUser ? 'Edit' : 'Tambah'} Pengguna</h2>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label>Nama</label>
                                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                                </div>
                            </div>
                             <div>
                                <label>Password</label>
                                <input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" placeholder={currentUser ? 'Kosongkan jika tidak diubah' : ''} required={!currentUser} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label>Cabang</label>
                                    <select value={userBranchId} onChange={e => setUserBranchId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white" required>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label>Status</label>
                                    <select value={userIsActive ? 'true' : 'false'} onChange={e => setUserIsActive(e.target.value === 'true')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                        <option value="true">Aktif</option>
                                        <option value="false">Nonaktif</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeUserModal} className="px-4 py-2 bg-slate-200 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Branches;