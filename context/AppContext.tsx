import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { User, Branch, Transaction, Role, Category, TransactionType } from '../types';
import { USERS, BRANCHES, TRANSACTIONS, CATEGORIES } from '../constants';

// Kunci untuk localStorage
const LS_KEYS = {
  USERS: 'pphq_users',
  BRANCHES: 'pphq_branches',
  TRANSACTIONS: 'pphq_transactions',
  CATEGORIES: 'pphq_categories',
  CURRENT_USER: 'currentUser'
};

interface AppContextType {
  currentUser: User | null;
  users: User[];
  branches: Branch[];
  transactions: Transaction[];
  allTransactions: Transaction[];
  categories: Category[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  resetData: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdBy' | 'lastEditedBy'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => Branch;
  updateBranch: (branch: Branch) => void;
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (user: User) => void;
  deleteBranchAndUser: (branchId: string) => void; // Tambahkan fungsi hapus
}

export const AppContext = createContext<AppContextType | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

// Helper untuk mendapatkan state awal dari localStorage atau data default
const getInitialState = <T,>(key: string, initialData: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialData;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return initialData;
    }
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialState(LS_KEYS.CURRENT_USER, null));
  const [users, setUsers] = useState<User[]>(() => getInitialState(LS_KEYS.USERS, USERS));
  const [branches, setBranches] = useState<Branch[]>(() => getInitialState(LS_KEYS.BRANCHES, BRANCHES));
  const [transactionsData, setTransactionsData] = useState<Transaction[]>(() => getInitialState(LS_KEYS.TRANSACTIONS, TRANSACTIONS));
  const [categories, setCategories] = useState<Category[]>(() => getInitialState(LS_KEYS.CATEGORIES, CATEGORIES));

  // Efek untuk menyimpan perubahan state ke localStorage
  useEffect(() => { localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(LS_KEYS.BRANCHES, JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactionsData)); }, [transactionsData]);
  useEffect(() => { localStorage.setItem(LS_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const resetData = useCallback(() => {
      if(window.confirm('Apakah Anda yakin ingin mereset semua data ke kondisi awal? Semua perubahan akan hilang.')) {
        Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
        window.location.reload();
      }
  }, []);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'createdBy' | 'lastEditedBy'>) => {
    if (!currentUser) return;
    const newTransaction: Transaction = {
      id: `t${Date.now()}-${Math.random()}`,
      ...transactionData,
      createdBy: currentUser.id,
      lastEditedBy: currentUser.id,
    };
    setTransactionsData(prev => [newTransaction, ...prev]);
  }, [currentUser]);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    if (!currentUser) return;
    setTransactionsData(prev => prev.map(t => 
        t.id === updatedTransaction.id 
        ? { ...updatedTransaction, lastEditedBy: currentUser.id } 
        : t
    ));
  }, [currentUser]);

  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactionsData(prev => prev.filter(t => t.id !== transactionId));
  }, []);

  const addCategory = useCallback((categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
        id: `c${Date.now()}`,
        ...categoryData,
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((updatedCategory: Category) => {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
  }, []);

  const addBranch = useCallback((branchData: Omit<Branch, 'id'>): Branch => {
    const newBranch: Branch = {
        id: `b${Date.now()}`,
        ...branchData,
    };
    setBranches(prev => [newBranch, ...prev]);
    return newBranch;
  }, []);

  const updateBranch = useCallback((updatedBranch: Branch) => {
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id' | 'lastLogin'>) => {
      const newUser: User = {
          id: `u${Date.now()}`,
          ...userData,
          lastLogin: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && updatedUser.id === currentUser.id) {
      setCurrentUser(updatedUser);
    }
  }, [currentUser]);
  
  const deleteBranchAndUser = useCallback((branchId: string) => {
    const userToDelete = users.find(u => u.branchId === branchId);
    setBranches(prev => prev.filter(b => b.id !== branchId));
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    }
  }, [users]);

  const visibleTransactions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === Role.Admin) return transactionsData;
    return transactionsData.filter(t => t.branchId === currentUser.branchId);
  }, [currentUser, transactionsData]);

  const value = useMemo(() => ({
    currentUser,
    users,
    branches,
    transactions: visibleTransactions,
    allTransactions: transactionsData,
    categories,
    login,
    logout,
    resetData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBranch,
    updateBranch,
    addUser,
    updateUser,
    deleteBranchAndUser,
  }), [
      currentUser, users, branches, visibleTransactions, transactionsData, categories,
      login, logout, resetData, addTransaction, updateTransaction, deleteTransaction, 
      addCategory, updateCategory, deleteCategory, addBranch, updateBranch, 
      addUser, updateUser, deleteBranchAndUser
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};