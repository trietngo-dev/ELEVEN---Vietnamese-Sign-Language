import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    CreditCard,
    Wallet,
    Search,
    ShoppingCart,
    Edit2,
    X,
    Check,
    Award,
    TrendingUp,
    Settings,
    Trash2
} from 'lucide-react';
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const getPlanDisplayName = (code: string) => {
    const c = code.toLowerCase();
    if (c === 'pro') return 'Chuyên nghiệp';
    if (c === 'premium') return 'Cao cấp';
    if (c === 'free' || c === 'basic') return 'Cơ bản';
    return code;
};

const AdminRevenue: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'plans'>('overview');

    // Core Data States
    const [plans, setPlans] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [userMap, setUserMap] = useState<Record<number, any>>({});

    // UI controls
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'FAILED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // Loadings
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);

    // Modal Config state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState<number>(0);
    const [newDiscountPercent, setNewDiscountPercent] = useState<number>(0);
    const [newTranslationLimit, setNewTranslationLimit] = useState(0);
    const [newPracticeLimit, setNewPracticeLimit] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Notification custom modal state
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    } | null>(null);

    const [planToDelete, setPlanToDelete] = useState<any | null>(null);

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;
        try {
            const token = tokenStorage.getToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/api/subscription_plans/${planToDelete.id}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                setNotification({
                    isOpen: true,
                    type: 'success',
                    title: 'Xóa thành công!',
                    message: `Gói đăng ký ${planToDelete.name} đã được xóa thành công.`
                });
                loadAllData();
            } else {
                const errData = await res.json().catch(() => ({}));
                setNotification({
                    isOpen: true,
                    type: 'error',
                    title: 'Xóa thất bại!',
                    message: errData.message || 'Lỗi khi xóa gói đăng ký.'
                });
            }
        } catch (err) {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Lỗi kết nối!',
                message: 'Không thể kết nối đến máy chủ.'
            });
        } finally {
            setPlanToDelete(null);
        }
    };

    // Initial Data loading
    const loadAllData = () => {
        const token = tokenStorage.getToken();
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // 1. Fetch Subscription plans
        fetch(`${API_BASE_URL}/api/subscription_plans`, { headers })
            .then((res) => {
                if (res.ok) return res.json();
                return null;
            })
            .then((data) => {
                if (data && data.items) {
                    setPlans(data.items);
                } else if (Array.isArray(data)) {
                    setPlans(data);
                }
                setIsLoadingPlans(false);
            })
            .catch((err) => {
                console.error("Lỗi khi tải gói đăng ký:", err);
                setIsLoadingPlans(false);
            });

        // 2. Fetch Users (admin only access)
        fetch(`${API_BASE_URL}/api/users?page=1&pageSize=1000`, { headers })
            .then((res) => {
                if (res.ok) return res.json();
                return null;
            })
            .then((data) => {
                const items = data?.items || data || [];
                if (Array.isArray(items)) {
                    const map: Record<number, any> = {};
                    items.forEach((u: any) => {
                        map[u.id] = u;
                    });
                    setUserMap(map);
                }
            })
            .catch((err) => console.error("Lỗi khi tải thông tin học viên:", err));

        // 3. Fetch Transactions
        fetch(`${API_BASE_URL}/api/payment_transactions?page=1&pageSize=1000`, { headers })
            .then((res) => {
                if (res.ok) return res.json();
                return null;
            })
            .then((data) => {
                const items = data?.items || data || [];
                if (Array.isArray(items)) {
                    // Sort transactions by date descending
                    const sorted = [...items].sort((a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setTransactions(sorted);
                }
                setIsLoadingStats(false);
            })
            .catch((err) => {
                console.error("Lỗi khi tải lịch sử giao dịch:", err);
                setIsLoadingStats(false);
            });
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Filter transactions dynamically
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const user = userMap[t.userId];
            const userName = user?.name || '';
            const userEmail = user?.email || '';

            const matchesSearch =
                t.id.toString().includes(searchTerm) ||
                t.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userEmail.toLowerCase().includes(searchTerm.toLowerCase());

            const isPaid = t.status === 1 || t.status === 'Paid' || t.status === 'PAID';
            const isPending = t.status === 0 || t.status === 'Pending' || t.status === 'PENDING';
            const isFailed = t.status === 2 || t.status === 'Failed' || t.status === 'FAILED';

            if (statusFilter === 'ALL') return matchesSearch;
            if (statusFilter === 'PENDING') return matchesSearch && isPending;
            if (statusFilter === 'PAID') return matchesSearch && isPaid;
            if (statusFilter === 'FAILED') return matchesSearch && isFailed;
            return matchesSearch;
        });
    }, [transactions, userMap, searchTerm, statusFilter]);

    // Paginated Transactions
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(startIndex, startIndex + pageSize);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

    // Stats calculations
    const stats = useMemo(() => {
        const paidTxns = transactions.filter(t => t.status === 1 || t.status === 'Paid' || t.status === 'PAID');
        const total = paidTxns.reduce((sum, t) => sum + t.amountVnd, 0);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthPaid = paidTxns.filter(t => {
            const d = new Date(t.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const monthTotal = monthPaid.reduce((sum, t) => sum + t.amountVnd, 0);

        const pending = transactions.filter(t => t.status === 0 || t.status === 'Pending' || t.status === 'PENDING').length;

        return {
            totalRevenue: total,
            monthRevenue: monthTotal,
            successfulCount: paidTxns.length,
            pendingCount: pending
        };
    }, [transactions]);

    // Chart Data calculations
    const chartData = useMemo(() => {
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const paidTxns = transactions.filter(t => t.status === 1 || t.status === 'Paid' || t.status === 'PAID');
        const currentYear = new Date().getFullYear();

        const rawData = months.map((label, idx) => {
            const sum = paidTxns
                .filter(t => {
                    const d = new Date(t.createdAt);
                    return d.getMonth() === idx && d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => acc + t.amountVnd, 0);
            return {
                label,
                value: sum,
                amount: sum > 0 ? `${(sum / 1000000).toFixed(1)}M` : '0đ'
            };
        });

        const maxVal = Math.max(...rawData.map(d => d.value), 1);
        return rawData.map(d => ({
            ...d,
            percent: (d.value / maxVal) * 100
        }));
    }, [transactions]);

    // Top Selling Packages
    const topPackages = useMemo(() => {
        const paidTxns = transactions.filter(t => t.status === 1 || t.status === 'Paid' || t.status === 'PAID');

        const countMap: Record<number, number> = {};
        paidTxns.forEach(t => {
            countMap[t.amountVnd] = (countMap[t.amountVnd] || 0) + 1;
        });

        return plans.map(p => {
            const count = countMap[p.priceVnd] || 0;
            const rev = count * p.priceVnd;
            return {
                name: p.name,
                code: p.code,
                sales: count,
                revenue: rev
            };
        }).sort((a, b) => b.sales - a.sales);
    }, [transactions, plans]);

    // Action triggers edit modal
    const handleOpenEdit = (plan: any) => {
        setEditingPlan(plan);
        setNewName(plan.name);
        setNewPrice(plan.priceVnd);
        setNewTranslationLimit(plan.dailyTranslationLimit);
        setNewPracticeLimit(plan.aiPracticeLimit);

        let discount = 0;
        const cycle = plan.billingCycle || 'monthly';
        if (cycle.includes('_')) {
            const parts = cycle.split('_');
            discount = parseInt(parts[parts.length - 1]) || 0;
        } else if (cycle.toLowerCase() === 'yearly') {
            discount = 40; // Gói Premium cũ mặc định 40%
        }
        setNewDiscountPercent(discount);

        setIsEditModalOpen(true);
    };

    // Save edited pricing plan
    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;

        setIsSaving(true);
        try {
            const token = tokenStorage.getToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const payload = {
                code: editingPlan.code,
                name: newName,
                billingCycle: `monthly_${newDiscountPercent}`, // Mặc định gói là tháng, kèm theo chiết khấu năm
                priceVnd: newPrice,
                dailyTranslationLimit: newTranslationLimit,
                aiPracticeLimit: newPracticeLimit,
                courseAccessScope: editingPlan.courseAccessScope,
                canSaveHistory: editingPlan.canSaveHistory,
                certificateEnabled: editingPlan.certificateEnabled,
                prioritySupport: editingPlan.prioritySupport,
                isActive: editingPlan.isActive,
                displayOrder: editingPlan.displayOrder
            };

            const res = await fetch(`${API_BASE_URL}/api/subscription_plans/${editingPlan.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                setNotification({
                    isOpen: true,
                    type: 'success',
                    title: 'Thành công!',
                    message: `Cập nhật cấu hình gói ${newName} thành công!`
                });
                loadAllData(); // Reload stats and lists
            } else {
                const errData = await res.json().catch(() => ({}));
                setNotification({
                    isOpen: true,
                    type: 'error',
                    title: 'Cập nhật thất bại!',
                    message: errData.message || 'Lỗi khi cập nhật cấu hình bảng giá.'
                });
            }
        } catch (err) {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Lỗi kết nối!',
                message: 'Không thể kết nối đến máy chủ.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyle = (status: any) => {
        if (status === 1 || status === 'Paid' || status === 'PAID') {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (status === 0 || status === 'Pending' || status === 'PENDING') {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        return 'bg-rose-50 text-rose-700 border-rose-200';
    };

    const getStatusText = (status: any) => {
        if (status === 1 || status === 'Paid' || status === 'PAID') return 'Thành công';
        if (status === 0 || status === 'Pending' || status === 'PENDING') return 'Đang xử lý';
        return 'Thất bại';
    };

    if (isLoadingStats) {
        return (
            <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#3c6c44] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-sm">Đang tải dữ liệu thống kê doanh thu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header Section */}
                <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản trị doanh thu</h1>
                        <p className="text-slate-500 mt-1">Quản lý định giá đăng ký hội viên và theo dõi lịch sử luồng tiền trực tiếp.</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview'
                                ? 'bg-[#3c6c44] text-white shadow-md shadow-[#3c6c44]/20'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <TrendingUp size={16} />
                            Thống kê & Giao dịch
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'plans'
                                ? 'bg-[#3c6c44] text-white shadow-md shadow-[#3c6c44]/20'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <Settings size={16} />
                            Quản lý Bảng giá
                        </button>
                    </div>
                </motion.div>

                {activeTab === 'overview' ? (
                    <>
                        {/* Stats Cards */}
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1 */}
                            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng doanh thu</p>
                                        <h3 className="text-2xl font-black text-slate-900">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</h3>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-emerald-50 text-[#3c6c44] border border-emerald-100/50">
                                        <DollarSign size={20} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-slate-500">
                                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mr-2">Live</span>
                                    Dữ liệu đồng bộ trực tiếp
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doanh thu tháng này</p>
                                        <h3 className="text-2xl font-black text-slate-900">{stats.monthRevenue.toLocaleString('vi-VN')} ₫</h3>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/50">
                                        <Wallet size={20} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-slate-500">
                                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mr-2">Tháng {new Date().getMonth() + 1}</span>
                                    Tháng hiện tại
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Giao dịch thành công</p>
                                        <h3 className="text-2xl font-black text-slate-900">{stats.successfulCount}</h3>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100/50">
                                        <CreditCard size={20} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-slate-500">
                                    <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mr-2">Paid</span>
                                    Đã kích hoạt quyền hội viên
                                </div>
                            </div>

                            {/* Card 4 */}
                            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Giao dịch đang chờ</p>
                                        <h3 className="text-2xl font-black text-slate-900">{stats.pendingCount}</h3>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/50">
                                        <ShoppingCart size={20} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-slate-500">
                                    <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mr-2">Pending</span>
                                    Đang chờ quét QR
                                </div>
                            </div>
                        </motion.div>

                        {/* Charts and Data */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Chart Section */}
                            <motion.div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 xl:col-span-2 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">Biểu đồ doanh thu thực</h3>
                                        <p className="text-xs text-slate-500 mt-1">Biểu diễn dòng tiền thành công (Paid) phát sinh theo từng tháng trong năm {new Date().getFullYear()}</p>
                                    </div>
                                </div>

                                <div className="flex-1 flex items-end justify-between gap-2 h-72 pb-6 pt-4 border-b border-slate-100 relative">
                                    {/* Grid Lines */}
                                    <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between text-[10px] text-slate-400 font-bold z-0">
                                        <div className="flex justify-between items-center w-full relative">
                                            <span className="bg-white pr-2 -translate-y-1/2">Max</span>
                                            <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-dashed border-t"></div>
                                        </div>
                                        <div className="flex justify-between items-center w-full relative">
                                            <span className="bg-white pr-2 -translate-y-1/2">50%</span>
                                            <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-dashed border-t"></div>
                                        </div>
                                        <div className="flex justify-between items-center w-full relative">
                                            <span className="bg-white pr-2 -translate-y-1/2">0đ</span>
                                            <div className="h-px bg-slate-100 w-full absolute left-8 right-0 border-solid border-t"></div>
                                        </div>
                                    </div>

                                    {/* Bars */}
                                    <div className="w-full h-full flex justify-between items-end pl-10 z-10">
                                        {chartData.map((d, i) => (
                                            <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end px-1 sm:px-2">
                                                <div className="relative w-full max-w-[40px] flex items-end h-full">
                                                    {/* Tooltip */}
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl whitespace-nowrap transition-opacity pointer-events-none z-20 shadow-md">
                                                        {d.value.toLocaleString('vi-VN')} ₫
                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                    </div>

                                                    {/* Actual Bar */}
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${d.percent}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
                                                        className="w-full bg-[#3c6c44] rounded-t-lg relative z-10 group-hover:bg-[#315736] transition-colors shadow-sm"
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pl-10 pt-4">
                                    {chartData.map((d, i) => (
                                        <span key={i} className="flex-1 text-center text-xs text-slate-500 font-bold">{d.label}</span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Top Products */}
                            <motion.div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col">
                                <h3 className="text-base font-black text-slate-900 mb-6">Xếp hạng lượt mua</h3>
                                <div className="space-y-6 flex-1">
                                    {topPackages.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3c6c44] font-black text-sm">
                                                    #{i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5">{item.sales} lượt giao dịch</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">{item.revenue.toLocaleString('vi-VN')} ₫</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Transactions Table */}
                        <motion.div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Chi tiết lịch sử luồng tiền</h3>
                                    <p className="text-xs text-slate-400 mt-1">Danh sách đầy đủ tất cả các yêu cầu và lịch sử giao dịch thanh toán.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Tìm mã GD, học viên..."
                                            className="pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all w-full sm:w-60"
                                        />
                                    </div>
                                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                                        {(['ALL', 'PAID', 'PENDING', 'FAILED'] as const).map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider transition-all uppercase ${statusFilter === filter
                                                    ? 'bg-white text-slate-800 shadow-sm'
                                                    : 'text-slate-400 hover:text-slate-700'
                                                    }`}
                                            >
                                                {filter === 'ALL' ? 'Tất cả' : filter === 'PAID' ? 'Thành công' : filter === 'PENDING' ? 'Chờ duyệt' : 'Thất bại'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-400 text-xs border-b border-slate-100 uppercase tracking-wider font-bold">
                                            <th className="px-6 py-4 font-bold">Mã Giao dịch</th>
                                            <th className="px-6 py-4 font-bold">Học viên</th>
                                            <th className="px-6 py-4 font-bold">Phương thức</th>
                                            <th className="px-6 py-4 font-bold">Số tiền</th>
                                            <th className="px-6 py-4 font-bold">Mã tham chiếu PayOS</th>
                                            <th className="px-6 py-4 font-bold">Thời gian khởi tạo</th>
                                            <th className="px-6 py-4 font-bold">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTransactions.map((txn, i) => {
                                            const user = userMap[txn.userId];
                                            return (
                                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-slate-600">#{txn.id}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900">{user?.name || `Học viên #${txn.userId}`}</span>
                                                            <span className="text-[11px] text-slate-400 mt-0.5">{user?.email || 'Chưa cập nhật email'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-semibold text-slate-500">{txn.paymentMethod} ({txn.paymentProvider || 'PayOS'})</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                                                        {txn.amountVnd.toLocaleString('vi-VN')} ₫
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                        {txn.providerTransactionRef || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                                                        {new Date(txn.createdAt).toLocaleString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase ${getStatusStyle(txn.status)}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${txn.status === 1 || txn.status === 'Paid' || txn.status === 'PAID'
                                                                ? 'bg-emerald-500'
                                                                : txn.status === 0 || txn.status === 'Pending' || txn.status === 'PENDING'
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-rose-500'
                                                                }`}></div>
                                                            {getStatusText(txn.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {paginatedTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-slate-400 bg-white">
                                                    Không tìm thấy giao dịch nào phù hợp với bộ lọc.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold bg-white">
                                <span>Hiển thị {filteredTransactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredTransactions.length)} của {filteredTransactions.length} giao dịch</span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40"
                                    >
                                        Trước
                                    </button>
                                    <span className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    /* Price Config Section */
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#3c6c44]/5 rounded-bl-[100px] flex items-center justify-center pl-6 pb-6 text-[#3c6c44]">
                                    <Award size={20} />
                                </div>

                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Gói {getPlanDisplayName(plan.code)}</h3>
                                <h2 className="text-xl font-black text-slate-800 mb-2">{plan.name}</h2>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-extrabold text-slate-900">
                                        {plan.priceVnd.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        /tháng
                                    </span>
                                </div>

                                {(() => {
                                    const cycle = plan.billingCycle || 'monthly';
                                    let discount = 0;
                                    if (cycle.includes('_')) {
                                        const parts = cycle.split('_');
                                        discount = parseInt(parts[parts.length - 1]) || 0;
                                    } else if (cycle.toLowerCase() === 'yearly') {
                                        discount = 40; // Gói Premium cũ
                                    }
                                    const yearlyPrice = plan.priceVnd * 12;
                                    const discountedYearly = yearlyPrice * (100 - discount) / 100;
                                    return (
                                        <div className="text-[11px] text-slate-500 space-y-1 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                            <p className="font-bold text-slate-600">Gói năm (12 tháng):</p>
                                            <p>• Giá gốc: <span className="line-through">{yearlyPrice.toLocaleString('vi-VN')} VNĐ</span></p>
                                            <p>• Giảm giá: <span className="text-rose-600 font-extrabold">-{discount}%</span></p>
                                            <p>• Thực trả: <span className="text-[#3c6c44] font-black">{discountedYearly.toLocaleString('vi-VN')} VNĐ/năm</span></p>
                                        </div>
                                    );
                                })()}

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                                        <span className="font-bold text-slate-400">Dịch thuật AI / ngày:</span>
                                        <span className="font-extrabold text-[#3c6c44]">
                                            {plan.dailyTranslationLimit > 50000 ? 'Không giới hạn' : `${plan.dailyTranslationLimit} lượt`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                                        <span className="font-bold text-slate-400">Thực hành AI / ngày:</span>
                                        <span className="font-extrabold text-[#3c6c44]">
                                            {plan.aiPracticeLimit > 50000 ? 'Không giới hạn' : `${plan.aiPracticeLimit} lượt`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                                        <span className="font-bold text-slate-400">Phạm vi bài học:</span>
                                        <span className="font-semibold text-slate-700 capitalize">{plan.courseAccessScope}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pb-2">
                                        <span className="font-bold text-slate-400">Trạng thái hoạt động:</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border tracking-wider uppercase ${plan.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            {plan.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => handleOpenEdit(plan)}
                                        className="flex-1 py-3 rounded-2xl font-bold transition-all bg-slate-50 hover:bg-[#3c6c44] text-slate-700 hover:text-white border border-slate-100 hover:border-transparent flex items-center justify-center gap-2 hover:shadow-md hover:shadow-[#3c6c44]/15 text-sm"
                                    >
                                        <Edit2 size={14} />
                                        Sửa cấu hình
                                    </button>
                                    <button
                                        onClick={() => setPlanToDelete(plan)}
                                        className="px-4 py-3 rounded-2xl font-bold transition-all bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-transparent flex items-center justify-center gap-1.5 hover:shadow-md hover:shadow-red-600/15 text-sm"
                                        title="Xóa gói"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {isLoadingPlans && (
                            <div className="col-span-full py-12 text-center text-sm font-bold text-slate-400">
                                Đang tải thông tin cấu hình bảng giá...
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Editing Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingPlan && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">Chỉnh sửa cấu hình gói</h3>
                            <p className="text-xs text-slate-500 mb-6">Điều chỉnh giá cước và hạn mức tài nguyên cho gói đăng ký này.</p>

                            <form onSubmit={handleSavePlan} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tên gói hiển thị</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Đơn giá (VNĐ/tháng)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(Number(e.target.value))}
                                            className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all font-black"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₫</span>
                                    </div>
                                    <p className="text-[11px] text-[#3c6c44] mt-2 font-semibold">
                                        Preview: {newPrice.toLocaleString('vi-VN')} VNĐ/tháng
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Giảm giá gói năm (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            max={100}
                                            value={newDiscountPercent}
                                            onChange={(e) => setNewDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                                            className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all font-bold"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-2 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <p className="font-semibold text-slate-600">Tính giá 1 năm:</p>
                                        <p>• Giá gốc: <span className="line-through">{(newPrice * 12).toLocaleString('vi-VN')} VNĐ</span></p>
                                        <p>• Tiết kiệm được: <span className="text-rose-600 font-bold">-{(newPrice * 12 * newDiscountPercent / 100).toLocaleString('vi-VN')} VNĐ ({newDiscountPercent}%)</span></p>
                                        <p>• Thực trả: <span className="text-[#3c6c44] font-black">{(newPrice * 12 * (100 - newDiscountPercent) / 100).toLocaleString('vi-VN')} VNĐ/năm</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dịch thuật AI / ngày</label>
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            value={newTranslationLimit}
                                            onChange={(e) => setNewTranslationLimit(Number(e.target.value))}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Luyện AI / ngày</label>
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            value={newPracticeLimit}
                                            onChange={(e) => setNewPracticeLimit(Number(e.target.value))}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/20 focus:border-[#3c6c44] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-3 text-sm text-slate-500 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-3 bg-[#3c6c44] text-white font-bold rounded-2xl hover:bg-[#315736] shadow-lg shadow-[#3c6c44]/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isSaving ? (
                                            <>Đang lưu...</>
                                        ) : (
                                            <>
                                                <Check size={16} strokeWidth={2.5} />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {planToDelete && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl max-w-sm w-full text-center relative"
                        >
                            <button
                                onClick={() => setPlanToDelete(null)}
                                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mb-4">
                                <Trash2 size={22} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa gói</h3>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                Bạn có chắc chắn muốn xóa gói <strong>{planToDelete.name}</strong>? Hành động này không thể hoàn tác và sẽ xóa gói này khỏi hệ thống cơ sở dữ liệu.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPlanToDelete(null)}
                                    className="flex-1 py-3 text-sm text-slate-500 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all text-sm"
                                >
                                    Xóa gói
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Custom Confirmation / Notification Modal */}
                {notification && notification.isOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl max-w-sm w-full text-center relative"
                        >
                            <button
                                onClick={() => setNotification(null)}
                                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${notification.type === 'success'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                }`}>
                                {notification.type === 'success' ? (
                                    <Check size={20} strokeWidth={3} />
                                ) : (
                                    <X size={20} strokeWidth={3} />
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">{notification.title}</h3>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">{notification.message}</p>

                            <button
                                onClick={() => setNotification(null)}
                                className={`w-full py-3 font-bold rounded-2xl transition-all shadow-md text-sm ${notification.type === 'success'
                                    ? 'bg-[#3c6c44] text-white hover:bg-[#315736] shadow-[#3c6c44]/20'
                                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                                    }`}
                            >
                                Đồng ý
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRevenue;
