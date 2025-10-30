
import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import NonMoneyTransactionsPage from './pages/NonMoneyTransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import Branches from './pages/Branches';
import CashFlow from './pages/CashFlow';
import { TransactionNature, TransactionType, Role } from './types';
import BranchTransactions from './pages/BranchTransactions';
import ProfilePage from './pages/ProfilePage'; // Import halaman baru

const PrivateLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>;
  }
  const { currentUser } = context;

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/*"
        element={
          currentUser ? (
            <PrivateLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cash-flow" element={<CashFlow />} />
        <Route path="profile" element={<ProfilePage />} /> {/* Tambahkan rute profil */}

        {/* BranchUser specific routes */}
        {currentUser?.role === Role.BranchUser && (
          <>
            {/* FIX: Removed key prop to resolve TypeScript error. State reset is now handled within TransactionsPage. */}
            <Route path="income" element={<TransactionsPage type={TransactionType.Income} nature={TransactionNature.Money} />} />
            <Route path="income-non-money" element={<NonMoneyTransactionsPage />} />
            {/* FIX: Removed key prop to resolve TypeScript error. State reset is now handled within TransactionsPage. */}
            <Route path="expenses" element={<TransactionsPage type={TransactionType.Expense} />} />
          </>
        )}
        
        {/* Admin specific routes */}
        {currentUser?.role === Role.Admin && (
            <>
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="branches" element={<Branches />} />
                <Route path="branch-transactions/:branchId" element={<BranchTransactions />} />
            </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
