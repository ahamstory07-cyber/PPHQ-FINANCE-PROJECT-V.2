import React, { createContext, useState, useEffect, ReactNode, useCallback, PropsWithChildren, useMemo } from 'react';
import { AppContextType, User, Branch, Category, Transaction, Role, TransactionType, TransactionNature } from '../types';

// Arahkan ke API server lokal yang jalan di VPS kita sendiri
const API_URL = '/api/action';

const callApi = async (action: string, payload?: any) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message || 'An unknown API error occurred.');
        }

        return result.data;
    } catch (error) {
        console.error(`API Error on action "${action}":`, error);
        throw error;
    }
};


const defaultContextValue: AppContextType = {
  currentUser: null,
  isLoading: true,
  users: [],
  branches: [],
  categories: [],
  transactions: [],
  allTransactions: [],
  login: async () => false,
  logout: () => {},
  resetData: async () => {},
  updateUser: async () => {},
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
  addBranch: async () => {},
  updateBranch: async () => {},
  deleteBranch: async () => {},
  addUser: async () => {},
  updateUserByAdmin: async () => {},
  deleteUser: async () => {},
};

export const AppContext = createContext<AppContextType>(defaultContextValue);

export const AppProvider = ({ children }: PropsWithChildren) => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (currentUser) {
                setIsLoading(true);
                try {
                    const data = await callApi('getAllData');
                    setUsers(data.users || []);
                    setBranches(data.branches || []);
                    setCategories(data.categories || []);
                    setAllTransactions(data.allTransactions || []);
                } catch (error) {
                    console.error("Could not load initial application data.", error);
                    alert("Gagal memuat data aplikasi. Silakan coba login kembali.");
                    logout(); // Force logout on data fetch failure
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [currentUser]); // Re-fetch data if the user logs in/out

    useEffect(() => {
        if(currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const data = await callApi('login', { email, password });
            if (data.user && data.user.isActive) {
                setCurrentUser(data.user);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setUsers([]);
        setBranches([]);
        setCategories([]);
        setAllTransactions([]);
    }, []);
    
    const resetData = useCallback(async () => {
       if (window.confirm("Yakin ingin mereset semua data di Google Sheet? Aksi ini tidak dapat dibatalkan.")) {
            setIsLoading(true);
            try {
                const data = await callApi('resetData');
                 setUsers(data.users || []);
                setBranches(data.branches || []);
                setCategories(data.categories || []);
                setAllTransactions(data.allTransactions || []);
                alert('Data berhasil direset.');
            } catch (error) {
                alert('Gagal mereset data.');
            } finally {
                setIsLoading(false);
            }
       }
    }, []);

    const updateUser = useCallback(async (updatedUser: User) => {
        if (currentUser && currentUser.id === updatedUser.id) {
            const data = await callApi('updateUser', { user: updatedUser });
            setUsers(prev => prev.map(u => u.id === data.user.id ? data.user : u));
            setCurrentUser(data.user);
        }
    }, [currentUser]);

    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdBy'>) => {
        if (!currentUser) return;
        const newTransactionData = { ...transaction, createdBy: currentUser.id };
        const data = await callApi('addTransaction', { transaction: newTransactionData });
        setAllTransactions(prev => [...prev, data.newTransaction]);
    }, [currentUser]);

    const updateTransaction = useCallback(async (transaction: Transaction) => {
         const data = await callApi('updateTransaction', { transaction });
         setAllTransactions(prev => prev.map(t => t.id === data.updatedTransaction.id ? data.updatedTransaction : t));
    }, []);

    const deleteTransaction = useCallback(async (id: string) => {
        await callApi('deleteTransaction', { id });
        setAllTransactions(prev => prev.filter(t => t.id !== id));
    }, []);

    const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
        const data = await callApi('addCategory', { category });
        setCategories(prev => [...prev, data.newCategory]);
    }, [])
    const updateCategory = useCallback(async (category: Category) => {
        const data = await callApi('updateCategory', { category });
        setCategories(prev => prev.map(c => c.id === data.updatedCategory.id ? data.updatedCategory : c));
    }, [])
    const deleteCategory = useCallback(async (id: string) => {
        await callApi('deleteCategory', { id });
        setCategories(prev => prev.filter(c => c.id !== id));
    }, [])

    const addBranch = useCallback(async (branch: Omit<Branch, 'id'>) => {
        const data = await callApi('addBranch', { branch });
        setBranches(prev => [...prev, data.newBranch]);
    }, [])
    const updateBranch = useCallback(async (branch: Branch) => {
        const data = await callApi('updateBranch', { branch });
        setBranches(prev => prev.map(b => b.id === data.updatedBranch.id ? data.updatedBranch : b));
    }, [])
    const deleteBranch = useCallback(async (id: string) => {
        const data = await callApi('deleteBranch', { id });
        setBranches(data.branches);
        setUsers(data.users);
        setAllTransactions(data.allTransactions);
    }, [])

    const addUser = useCallback(async (user: Omit<User, 'id'>) => {
        const data = await callApi('addUser', { user });
        setUsers(prev => [...prev, data.newUser]);
    }, [])
    const updateUserByAdmin = useCallback(async (user: User) => {
        const data = await callApi('updateUserByAdmin', { user });
        setUsers(prev => prev.map(u => u.id === data.updatedUser.id ? data.updatedUser : u));
    }, [])
    const deleteUser = useCallback(async (id: string) => {
        await callApi('deleteUser', { id });
        setUsers(prev => prev.filter(u => u.id !== id));
    }, [])
    
    const value = useMemo(() => {
        const transactions = currentUser?.role === Role.Admin 
            ? allTransactions 
            : allTransactions.filter(t => t.branchId === currentUser?.branchId);
        
        return {
            currentUser,
            isLoading,
            users,
            branches,
            categories,
            transactions,
            allTransactions,
            login,
            logout,
            resetData,
            updateUser,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addCategory,
            updateCategory,
            deleteCategory,
            addBranch,
            updateBranch,
            deleteBranch,
            addUser,
            updateUserByAdmin,
            deleteUser,
        };
    }, [
        currentUser, isLoading, users, branches, categories, allTransactions,
        login, logout, resetData, updateUser, addTransaction, updateTransaction,
        deleteTransaction, addCategory, updateCategory, deleteCategory, addBranch,
        updateBranch, deleteBranch, addUser, updateUserByAdmin, deleteUser
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};