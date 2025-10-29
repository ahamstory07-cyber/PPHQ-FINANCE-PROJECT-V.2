import React from 'react';
import { User, Branch, Transaction, Category, Role, TransactionType, TransactionNature } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'John Doe', email: 'admin@pphq.com', password: 'adminpassword', role: Role.Admin, branchId: null, isActive: true, lastLogin: '2023-10-27T10:00:00Z' },
  { id: 'u2', name: 'Jane Smith', email: 'branch1@pphq.com', password: 'password123', role: Role.BranchUser, branchId: 'b1', isActive: true, lastLogin: '2023-10-27T09:00:00Z' },
  { id: 'u3', name: 'Mike Johnson', email: 'branch2@pphq.com', password: 'password123', role: Role.BranchUser, branchId: 'b2', isActive: false, lastLogin: '2023-10-26T15:00:00Z' },
  { id: 'u4', name: 'Anna J.', email: 'branch3@pphq.com', password: 'password123', role: Role.BranchUser, branchId: 'b3', isActive: true, lastLogin: '2023-10-27T11:00:00Z' },
  // Add users for other branches
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `u${i + 5}`,
    name: `User Cabang ${String.fromCharCode(68 + i)}`,
    email: `branch${i + 4}@pphq.com`,
    password: 'password123',
    role: Role.BranchUser,
    branchId: `b${i + 4}`,
    isActive: i % 2 === 0,
    lastLogin: `2023-10-27T${12 + i}:00:00Z`,
  })),
];

export const BRANCHES: Branch[] = Array.from({ length: 10 }, (_, i) => ({
  id: `b${i + 1}`,
  name: `Cabang ${String.fromCharCode(65 + i)}`,
  location: `Kota ${String.fromCharCode(65 + i)}`,
  pic: `PIC ${i + 1}`,
  isActive: i % 3 !== 0,
}));

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Donasi', type: TransactionType.Income },
  { id: 'c2', name: 'Bantuan Barang', type: TransactionType.Income },
  { id: 'c3', name: 'Gaji', type: TransactionType.Expense },
  { id: 'c4', name: 'Operasional', type: TransactionType.Expense },
  { id: 'c5', name: 'Program Sosial', type: TransactionType.Expense },
  { id: 'c6', name: 'Utilitas', type: TransactionType.Expense },
];

export const TRANSACTIONS: Transaction[] = [
  ...Array.from({ length: 50 }, (_, i) => {
    const month = Math.floor(i / 5) + 1;
    const day = (i % 28) + 1;
    const branch = BRANCHES[i % 10];
    return {
      id: `t${i + 1}`,
      date: `2023-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      branchId: branch.id,
      category: i % 5 === 0 ? 'Bantuan Barang' : 'Donasi',
      description: `Donasi dari perorangan ${i + 1}`,
      amount: i % 5 === 0 ? 0 : Math.floor(Math.random() * 500) + 50,
      type: TransactionType.Income,
      nature: i % 5 === 0 ? TransactionNature.NonMoney : TransactionNature.Money,
      createdBy: 'u2',
      lastEditedBy: 'u1',
    };
  }),
  ...Array.from({ length: 40 }, (_, i) => {
    const month = Math.floor(i / 4) + 1;
    const day = (i % 28) + 1;
    const branch = BRANCHES[i % 10];
    return {
      id: `t${i + 51}`,
      date: `2023-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      branchId: branch.id,
      category: i % 2 === 0 ? 'Gaji' : 'Operasional',
      description: `Biaya operasional ${i + 1}`,
      amount: Math.floor(Math.random() * 200) + 20,
      type: TransactionType.Expense,
      nature: TransactionNature.Money,
      createdBy: 'u3',
      lastEditedBy: 'u3',
    };
  }),
];

// SVG Icons
export const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="white"/>
    <path d="M13 12H21C23.2091 12 25 13.7909 25 16C25 18.2091 23.2091 20 21 20H13V12Z" fill="#15803d"/>
    <rect x="13" y="20" width="4" height="8" fill="#15803d"/>
  </svg>
);


// FIX: Exported all required icon components.
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export const IncomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
    </svg>
);

export const ExpenseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6 6m6-6l6 6" />
    </svg>
);

export const CashFlowIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667-11.667l3.181 3.183a8.25 8.25 0 0111.667 0l3.181-3.183m-11.667 11.667l-3.181-3.183a8.25 8.25 0 01-11.667 0L2.985 19.644z" />
    </svg>
);

export const BranchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6m-6 4.5h6M6.75 21v-5.25a2.25 2.25 0 012.25-2.25h3.75a2.25 2.25 0 012.25 2.25V21M6.75 3v1.5m10.5-1.5v1.5" />
    </svg>
);

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const GiftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H7.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 1.5v3m0 0l-3.75 3.75M12 4.5l3.75 3.75M3 11.25h18" />
    </svg>
);

export const CategoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

export const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const DeleteIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const ExportIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.625 21h12.75c1.24 0 2.25-1.01 2.25-2.25V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
