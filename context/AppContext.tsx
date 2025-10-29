import React, { createContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { User, Branch, Transaction, Role, Category, TransactionType } from '../types';
import { USERS, BRANCHES, TRANSACTIONS, CATEGORIES } from '../constants';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  branches: Branch[];
  transactions: Transaction[];
  allTransactions: Transaction[];
  categories: Category[];
  login: (email: string) => boolean;
  logout: () => void;
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
}

export const AppContext = createContext<AppContextType | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(USERS);
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [transactionsData, setTransactionsData] = useState<Transaction[]>(TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  const login = useCallback((email: string): boolean => {
    const user = users.find(u => u.email === email && u.isActive);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
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
  }, []);
  
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
  }), [
      currentUser, users, branches, visibleTransactions, transactionsData, categories,
      login, logout, addTransaction, updateTransaction, deleteTransaction, 
      addCategory, updateCategory, deleteCategory, addBranch, updateBranch, 
      addUser, updateUser
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};