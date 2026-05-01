import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo, HomeIcon, IncomeIcon, ExpenseIcon, CashFlowIcon, BranchIcon, UserIcon, GiftIcon, CategoryIcon, SettingsIcon } from '../constants';
import { useAppContext } from '../hooks/useAppContext';
import { Role } from '../types';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, onClick }) => (
    <NavLink
        to={to}
        end // Ensure exact match for the dashboard link
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 group ${
                isActive
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
            }`
        }
    >
        {icon}
        <span className="ml-3">{children}</span>
    </NavLink>
);

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const { currentUser } = useAppContext();

    const menuItems = [
        { to: '/', icon: <HomeIcon className="w-5 h-5" />, label: 'Dasbor', roles: [Role.Admin, Role.BranchUser] },
        { to: '/income', icon: <IncomeIcon className="w-5 h-5" />, label: 'Pemasukan Uang', roles: [Role.BranchUser] },
        { to: '/income-non-money', icon: <GiftIcon className="w-5 h-5" />, label: 'Pemasukan Non-Uang', roles: [Role.BranchUser] },
        { to: '/expenses', icon: <ExpenseIcon className="w-5 h-5" />, label: 'Pengeluaran', roles: [Role.BranchUser] },
        { to: '/cash-flow', icon: <CashFlowIcon className="w-5 h-5" />, label: 'Arus Kas', roles: [Role.Admin, Role.BranchUser] },
        { to: '/categories', icon: <CategoryIcon className="w-5 h-5" />, label: 'Manajemen Kategori', roles: [Role.Admin] },
        { to: '/branches', icon: <BranchIcon className="w-5 h-5" />, label: 'Manajemen Cabang & Pengguna', roles: [Role.Admin] },
        { to: '/settings', icon: <SettingsIcon className="w-5 h-5" />, label: 'Pengaturan', roles: [Role.Admin] },
    ];
    
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={toggleSidebar}
            ></div>
            
            <aside
                className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-sidebar text-white transform transition-transform duration-300 ease-in-out z-30
                    md:relative md:translate-x-0 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
                }
            >
                <div className="flex items-center gap-3 h-16 border-b border-green-700 px-4">
                    <Logo />
                    <h1 className="text-lg font-bold text-white">PPHQ Finance</h1>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems
                        .filter(item => currentUser && item.roles.includes(currentUser.role))
                        .map(item => (
                            <NavItem key={item.to} to={item.to} icon={item.icon} onClick={toggleSidebar}>
                                {item.label}
                            </NavItem>
                        ))
                    }
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;