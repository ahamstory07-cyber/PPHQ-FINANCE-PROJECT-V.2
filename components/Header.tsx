import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SearchIcon, BellIcon, ChevronDownIcon, LogoutIcon, MenuIcon } from '../constants';

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
    const { currentUser, logout } = useAppContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="h-16 bg-card shadow-sm flex items-center justify-between px-4 md:px-6 z-10">
            <div className="flex items-center">
                 <button
                    onClick={toggleSidebar}
                    className="md:hidden mr-3 p-1 rounded-md text-gray-600 hover:bg-gray-100 hover:text-primary focus:outline-none"
                    aria-label="Open sidebar"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                 <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Cari sesuatu..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                <button className="p-2 rounded-full text-gray-500 hover:bg-slate-100 hover:text-gray-700 transition-colors">
                    <BellIcon className="w-6 h-6" />
                </button>
                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <img 
                            src={`https://i.pravatar.cc/40?u=${currentUser?.id}`}
                            alt="User avatar" 
                            className="w-9 h-9 rounded-full"
                        />
                        <div className="hidden md:flex flex-col items-start">
                            <span className="font-semibold text-sm text-text-primary">{currentUser?.name}</span>
                            <span className="text-xs text-text-secondary">{currentUser?.role}</span>
                        </div>
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 hidden md:block" />
                    </button>
                    {dropdownOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5"
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <button
                                onClick={logout}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 transition-colors"
                            >
                                <LogoutIcon className="w-5 h-5 mr-2" />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
