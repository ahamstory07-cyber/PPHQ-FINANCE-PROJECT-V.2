// Define enums for specific, controlled sets of values.
export enum Role {
  Admin = 'Admin',
  BranchUser = 'BranchUser',
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
}

export enum TransactionNature {
    Money = 'Money',
    NonMoney = 'NonMoney',
}

// Define interfaces for our main data structures.
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password should be handled securely, optional here for client-side representation
  role: Role;
  branchId: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType; // 'Income' or 'Expense'
}

export interface Transaction {
  id: string;
  date: string; // ISO string format for dates
  branchId: string;
  category: string;
  description: string;
  type: TransactionType;
  nature: TransactionNature;
  amount: number; // For 'Money' nature
  item?: string; // For 'NonMoney' nature (e.g., '10 karung beras')
  createdBy: string; // User ID
}

// Define the shape of our application's context.
export interface AppContextType {
  currentUser: User | null;
  isLoading: boolean; // For tracking initial data load
  users: User[];
  branches: Branch[];
  categories: Category[];
  transactions: Transaction[]; // Transactions for the current user's branch
  allTransactions: Transaction[]; // All transactions (for Admin)
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetData: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  // Transaction management
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdBy'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // Category management
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Branch management
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (branch: Branch) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  // User management for Admin
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUserByAdmin: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}