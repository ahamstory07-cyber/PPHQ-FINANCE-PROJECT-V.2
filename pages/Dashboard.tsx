import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import DashboardCard from '../components/DashboardCard';
import MonthlyComparisonChart from '../components/charts/MonthlyComparisonChart';
import { Transaction, TransactionType, Role, Branch, TransactionNature } from '../types';
import { IncomeIcon, ExpenseIcon, BarChartIcon, BranchIcon } from '../constants';
import CategorySummary from '../components/CategorySummary';

const RecentTransactions = ({ transactions, branches }: { transactions: Transaction[], branches: Branch[] }) => {
    const recent = transactions
        .filter(t => t.nature === 'Money')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'N/A';

    return (
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Transaksi Terkini</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold">Deskripsi</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Cabang</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Jumlah</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {recent.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">{t.description}</td>
                                <td className="px-4 py-3">{getBranchName(t.branchId)}</td>
                                <td className={`px-4 py-3 font-semibold ${t.type === TransactionType.Income ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.type === TransactionType.Income ? '+' : '-'}Rp{t.amount.toLocaleString('id-ID')}
                                </td>
                                <td className="px-4 py-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                            </tr>
                        ))}
                         {recent.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-text-secondary">Tidak ada transaksi terkini.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface BranchSummaryCardProps {
    branch: Branch;
    transactions: Transaction[];
}

const BranchSummaryCard: React.FC<BranchSummaryCardProps> = ({ branch, transactions }) => {
    const { income, expense, balance } = useMemo(() => {
        let income = 0;
        let expense = 0;
        transactions
            .filter(t => t.branchId === branch.id && t.nature === TransactionNature.Money)
            .forEach(t => {
                if (t.type === TransactionType.Income) {
                    income += t.amount;
                } else {
                    expense += t.amount;
                }
            });
        return { income, expense, balance: income - expense };
    }, [branch.id, transactions]);

    return (
        <Link to={`/branch-transactions/${branch.id}`} className="bg-card p-4 rounded-xl border border-border flex flex-col justify-between hover:shadow-md hover:border-primary transition-all duration-200 group">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-text-primary group-hover:text-primary">{branch.name}</p>
                        <p className="text-xs text-text-secondary">{branch.location}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-100">
                        <BranchIcon className="w-5 h-5 text-primary" />
                    </div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Pemasukan</span>
                    <span className="font-medium text-green-600">Rp{income.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Pengeluaran</span>
                    <span className="font-medium text-red-600">Rp{expense.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                    <p className="text-sm font-semibold text-text-secondary">Saldo Saat Ini</p>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-text-primary' : 'text-red-600'}`}>
                        Rp{balance.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
        </Link>
    );
}

const Dashboard = () => {
    const { currentUser, transactions, branches, allTransactions } = useAppContext();
    const [selectedBranchId, setSelectedBranchId] = useState<string>(branches.length > 0 ? branches[0].id : '');

    const dataToDisplay = currentUser?.role === Role.Admin ? allTransactions : transactions;

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;
        dataToDisplay.forEach(t => {
            if (t.type === TransactionType.Income && t.nature === 'Money') {
                totalIncome += t.amount;
            } else if (t.type === TransactionType.Expense) {
                totalExpense += t.amount;
            }
        });
        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    }, [dataToDisplay]);

    const selectedBranchTransactions = useMemo(() => {
        if (!selectedBranchId || currentUser?.role !== Role.Admin) return [];
        return allTransactions.filter(t => t.branchId === selectedBranchId);
    }, [allTransactions, selectedBranchId, currentUser?.role]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Halo, {currentUser?.name}!</h1>
                <p className="text-text-secondary mt-1">Selamat datang kembali, ini ringkasan keuangan Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <DashboardCard 
                    title="Total Pemasukan" 
                    value={`Rp${totalIncome.toLocaleString('id-ID')}`} 
                    icon={<IncomeIcon className="w-6 h-6 text-green-600"/>} 
                    iconColorClass="bg-green-100"
                />
                <DashboardCard 
                    title="Total Pengeluaran" 
                    value={`Rp${totalExpense.toLocaleString('id-ID')}`}
                    icon={<ExpenseIcon className="w-6 h-6 text-red-600"/>} 
                    iconColorClass="bg-red-100"
                />
                <DashboardCard 
                    title="Saldo Saat Ini" 
                    value={`Rp${balance.toLocaleString('id-ID')}`}
                    icon={<BarChartIcon className="w-6 h-6 text-blue-600"/>}
                    iconColorClass="bg-blue-100"
                />
            </div>

            {currentUser?.role === Role.BranchUser && (
                 <CategorySummary transactions={transactions} />
            )}

            {currentUser?.role === Role.Admin && (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-4">Ringkasan Keuangan per Cabang</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {branches.map(branch => (
                                <BranchSummaryCard key={branch.id} branch={branch} transactions={allTransactions} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h2 className="text-xl font-bold text-text-primary">Ringkasan Kategori per Cabang</h2>
                             <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                className="w-full sm:w-auto sm:max-w-xs px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm bg-white"
                                aria-label="Pilih Cabang"
                            >
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedBranchId ? (
                             <CategorySummary transactions={selectedBranchTransactions} />
                        ) : (
                            <p className="text-center py-8 text-text-secondary">Silakan pilih cabang untuk melihat ringkasan kategori.</p>
                        )}
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                     <MonthlyComparisonChart transactions={dataToDisplay} />
                </div>
                <div className="lg:col-span-2">
                     <RecentTransactions transactions={dataToDisplay} branches={branches} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;