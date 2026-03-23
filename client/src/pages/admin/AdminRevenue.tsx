import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Calendar,
    Filter,
    MoreHorizontal,
    Search,
    ShoppingCart
} from 'lucide-react';

const mockChartData = [
    { label: 'T1', value: 40, amount: '40TR' },
    { label: 'T2', value: 65, amount: '65TR' },
    { label: 'T3', value: 35, amount: '35TR' },
    { label: 'T4', value: 80, amount: '80TR' },
    { label: 'T5', value: 55, amount: '55TR' },
    { label: 'T6', value: 90, amount: '90TR' },
    { label: 'T7', value: 75, amount: '75TR' },
    { label: 'T8', value: 85, amount: '85TR' },
    { label: 'T9', value: 100, amount: '100TR' },
    { label: 'T10', value: 60, amount: '60TR' },
    { label: 'T11', value: 70, amount: '70TR' },
    { label: 'T12', value: 95, amount: '95TR' },
];

const mockTransactions = [
    { id: 'TXN-001', user: 'Nguyễn Văn A', email: 'nva@gmail.com', item: 'Khóa học VSL Cơ bản', amount: '500,000đ', date: '23/03/2026', status: 'Thành công' },
    { id: 'TXN-002', user: 'Trần Thị B', email: 'ttb1990@gmail.com', item: 'Combo Toàn diện', amount: '1,200,000đ', date: '23/03/2026', status: 'Thành công' },
    { id: 'TXN-003', user: 'Lê Minh C', email: 'leminhc@yahoo.com', item: 'Khóa Giao tiếp VSL', amount: '750,000đ', date: '22/03/2026', status: 'Đang xử lý' },
    { id: 'TXN-004', user: 'Phạm Văn D', email: 'pvd@outlook.com', item: 'Combo Nâng cao', amount: '900,000đ', date: '21/03/2026', status: 'Thất bại' },
    { id: 'TXN-005', user: 'Hoàng Thị E', email: 'hte123@gmail.com', item: 'Khóa học VSL Trẻ em', amount: '450,000đ', date: '20/03/2026', status: 'Thành công' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

const AdminRevenue: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState('Năm nay');

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header Section */}
                <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý doanh thu</h1>
                        <p className="text-slate-500 mt-1">Theo dõi biến động doanh thu và lịch sử giao dịch.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm">
                            <Calendar size={18} />
                            <span>{timeFilter}</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3c6c44] text-white rounded-xl hover:bg-[#2f5535] transition-colors font-medium shadow-sm shadow-[#3c6c44]/20">
                            <Download size={18} />
                            <span>Xuất báo cáo</span>
                        </button>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Tổng doanh thu</p>
                                <h3 className="text-2xl font-bold text-slate-900">124.5M ₫</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-green-50 text-[#3c6c44]">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="flex items-center font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={16} className="mr-1" />
                                12.5%
                            </span>
                            <span className="text-slate-500 ml-2">so với tháng trước</span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Doanh thu tháng này</p>
                                <h3 className="text-2xl font-bold text-slate-900">45.2M ₫</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="flex items-center font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={16} className="mr-1" />
                                8.2%
                            </span>
                            <span className="text-slate-500 ml-2">so với tháng trước</span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Số giao dịch (Tháng)</p>
                                <h3 className="text-2xl font-bold text-slate-900">342</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="flex items-center font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={16} className="mr-1" />
                                4.5%
                            </span>
                            <span className="text-slate-500 ml-2">so với tháng trước</span>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Khóa học / Combo bán ra</p>
                                <h3 className="text-2xl font-bold text-slate-900">156</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                <ShoppingCart size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="flex items-center font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                <ArrowDownRight size={16} className="mr-1" />
                                1.2%
                            </span>
                            <span className="text-slate-500 ml-2">so với tháng trước</span>
                        </div>
                    </div>
                </motion.div>

                {/* Charts and Data */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <motion.div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 xl:col-span-2 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h3>
                                <p className="text-sm text-slate-500 mt-1">Doanh thu hiển thị theo tháng trong năm</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm text-slate-800">12 Tháng</button>
                                <button className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-800 transition-colors">30 Ngày</button>
                                <button className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:text-slate-800 transition-colors">7 Ngày</button>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-2 h-72 pb-6 pt-4 border-b border-slate-100 relative">
                            {/* Y-axis labels mock */}
                            <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between text-xs text-slate-400 font-medium z-0">
                                <div className="flex justify-between items-center w-full relative">
                                    <span className="bg-white pr-2 -translate-y-1/2">100M</span>
                                    <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-dashed border-t"></div>
                                </div>
                                <div className="flex justify-between items-center w-full relative">
                                    <span className="bg-white pr-2 -translate-y-1/2">75M</span>
                                    <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-dashed border-t"></div>
                                </div>
                                <div className="flex justify-between items-center w-full relative">
                                    <span className="bg-white pr-2 -translate-y-1/2">50M</span>
                                    <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-dashed border-t"></div>
                                </div>
                                <div className="flex justify-between items-center w-full relative">
                                    <span className="bg-white pr-2 -translate-y-1/2">25M</span>
                                    <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-dashed border-t"></div>
                                </div>
                                <div className="flex justify-between items-center w-full relative">
                                    <span className="bg-white pr-2 -translate-y-1/2">0M</span>
                                    <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-solid border-t"></div>
                                </div>
                            </div>

                            {/* Bars */}
                            <div className="w-full h-full flex justify-between items-end pl-10 z-10">
                                {mockChartData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end px-1 sm:px-2">
                                        <div className="relative w-full max-w-[40px] flex items-end h-full">
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-opacity pointer-events-none z-20">
                                                {d.amount}
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                            </div>

                                            {/* Bar Background (hover) */}
                                            <div className="absolute inset-0 bg-slate-50 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            {/* Actual Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${d.value}%` }}
                                                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                                className="w-full bg-[#3c6c44] rounded-t-md relative z-10 group-hover:bg-[#2f5535] transition-colors"
                                            ></motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center pl-10 pt-4">
                            {mockChartData.map((d, i) => (
                                <span key={i} className="flex-1 text-center text-sm text-slate-500 font-medium">{d.label}</span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Sản phẩm bán chạy</h3>
                        <div className="space-y-6 flex-1">
                            {[
                                { name: 'Combo VSL Toàn diện', sales: 124, revenue: '148.8M ₫', increase: '+15%' },
                                { name: 'Khóa học VSL Cơ bản', sales: 89, revenue: '44.5M ₫', increase: '+8%' },
                                { name: 'Khóa Giao tiếp VSL', sales: 65, revenue: '48.7M ₫', increase: '-2%' },
                                { name: 'Combo Nâng cao', sales: 42, revenue: '37.8M ₫', increase: '+21%' },
                                { name: 'Khóa học VSL Trẻ em', sales: 38, revenue: '17.1M ₫', increase: '+5%' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3c6c44] font-bold">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.sales} lượt bán</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{item.revenue}</p>
                                        <p className={`text-xs mt-0.5 ${item.increase.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{item.increase}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Transactions Table */}
                <motion.div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Giao dịch gần đây</h3>
                            <p className="text-sm text-slate-500 mt-1">Danh sách các giao dịch mua khóa học và combo.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm giao dịch..."
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all w-full sm:w-64"
                                />
                            </div>
                            <button className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                                    <th className="px-6 py-4 font-medium">Mã GD</th>
                                    <th className="px-6 py-4 font-medium">Khách hàng</th>
                                    <th className="px-6 py-4 font-medium">Sản phẩm</th>
                                    <th className="px-6 py-4 font-medium">Số tiền</th>
                                    <th className="px-6 py-4 font-medium">Ngày</th>
                                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                                    <th className="px-6 py-4 text-center font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockTransactions.map((txn, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">{txn.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">{txn.user}</span>
                                                <span className="text-xs text-slate-500">{txn.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{txn.item}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{txn.amount}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{txn.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${txn.status === 'Thành công'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : txn.status === 'Đang xử lý'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                {txn.status === 'Thành công' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>}
                                                {txn.status === 'Đang xử lý' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></div>}
                                                {txn.status === 'Thất bại' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></div>}
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                        <span>Hiển thị 1 - 5 của 124 giao dịch</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50">Trước</button>
                            <button className="px-3 py-1.5 bg-[#3c6c44] text-white rounded-md font-medium">1</button>
                            <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">2</button>
                            <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">3</button>
                            <span className="px-3 py-1.5">...</span>
                            <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">Sau</button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AdminRevenue;
