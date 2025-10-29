
export enum Role {
  Admin = 'Admin',
  BranchUser = 'BranchUser'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added password field
  role: Role;
  branchId: string | null;
  isActive: boolean;
  lastLogin: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  pic: string;
  isActive: boolean;
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense'
}

export enum TransactionNature {
    Money = 'Money',
    NonMoney = 'Non-Money'
}

export interface Transaction {
  id: string;
  date: string;
  branchId: string;
  category: string;
  description: string;
  amount: number;
  type: TransactionType;
  nature: TransactionNature;
  createdBy: string;
  lastEditedBy: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}