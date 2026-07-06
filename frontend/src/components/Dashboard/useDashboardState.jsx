import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth, API_URL } from '../../context/AuthContext';
import {
  Plus,
  X,
  Trash2,
  Brain,
  FileText,
  IndianRupee,
  TrendingUp,
  Percent,
  AlertTriangle,
  FolderMinus,
  Sparkles,
  Bot,
  User,
  Loader2,
  Utensils,
  Coins,
  ArrowLeft
} from 'lucide-react';

export const CATEGORIES = [
  'Food & Dining',
  'Shopping & Clothing',
  'Utilities & Bills',
  'Transportation & Travel',
  'Entertainment & Leisure',
  'Healthcare & Fitness',
  'Education',
  'Others',
];

export const getGreeting = () => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good Morning';
  if (hr < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getBadgeClass = (cat) => {
  switch (cat) {
    case 'Food & Dining': return 'badge badge-food';
    case 'Shopping & Clothing': return 'badge badge-shopping';
    case 'Utilities & Bills': return 'badge badge-utilities';
    case 'Transportation & Travel': return 'badge badge-transport';
    case 'Entertainment & Leisure': return 'badge badge-entertainment';
    case 'Healthcare & Fitness': return 'badge badge-healthcare';
    case 'Education': return 'badge badge-education';
    default: return 'badge badge-others';
  }
};

export const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'Food & Dining': return <Utensils size={16} />;
    case 'Shopping & Clothing': return <Coins size={16} />;
    case 'Utilities & Bills': return <FileText size={16} />;
    case 'Transportation & Travel': return <TrendingUp size={16} />;
    case 'Entertainment & Leisure': return <Sparkles size={16} />;
    case 'Healthcare & Fitness': return <AlertTriangle size={16} />;
    case 'Education': return <FolderMinus size={16} />;
    default: return <IndianRupee size={16} />;
  }
};

export const useDashboardState = () => {
  const { token, user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Forms & Modals
  const [manualForm, setManualForm] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [quickLogText, setQuickLogText] = useState('');
  const [quickLogLoading, setQuickLogLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exit: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Budget editing state
  const [editingBudget, setEditingBudget] = useState({});

  // Mobile Views state: 'home' | 'analytics' | 'profile' | 'history'
  const [activeMobileView, setActiveMobileView] = useState('home');
  // Mobile Timeframe: always Weekly view by default
  const [timeframe, setTimeframe] = useState('Weekly');
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState('All');

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      // Fetch Expenses, Savings Goals, and Budgets in parallel
      const [expensesRes, savingsRes, budgetsRes] = await Promise.all([
        fetch(`${API_URL}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/savings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/budgets?month=${selectedMonth}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      // Parse all JSON responses in parallel
      const [expensesData, savingsData, budgetsData] = await Promise.all([
        expensesRes.json(),
        savingsRes.json(),
        budgetsRes.json()
      ]);

      // Batch state updates so React renders them together
      if (expensesRes.ok) setExpenses(expensesData);
      if (savingsRes.ok) setSavingsGoals(savingsData);
      
      if (budgetsRes.ok) {
        setBudgets(budgetsData);
        // Pre-fill budget input state
        const initialBudgetInputs = {};
        CATEGORIES.forEach((cat) => {
          const match = budgetsData.find((b) => b.category === cat);
          initialBudgetInputs[cat] = match ? match.limitAmount.toString() : '';
        });
        const overallMatch = budgetsData.find((b) => b.category === 'Overall');
        initialBudgetInputs['Overall'] = overallMatch ? overallMatch.limitAmount.toString() : '';
        setEditingBudget(initialBudgetInputs);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Verify it is running.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, token]);

  useEffect(() => {
    if (user && token) {
      const isMobile = window.innerWidth <= 767;
      const onboarded = localStorage.getItem(`tally_onboarded_mobile_v1_${user.id}`);
      if (isMobile && onboarded !== 'true') {
        setIsOnboardingOpen(true);
      }
    }
  }, [user, token]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(manualForm),
      });

      if (res.ok) {
        setManualForm({
          amount: '',
          category: 'Food & Dining',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        fetchDashboardData();
        setActiveMobileView('home');
        showToast('Expense logged successfully!');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to add expense');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickLog = async (e) => {
    e.preventDefault();
    if (!quickLogText.trim() || !token) return;

    setQuickLogLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/expenses/quick-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: quickLogText }),
      });

      if (res.ok) {
        const parsedExpense = await res.json();
        
        const isMobile = window.innerWidth <= 767;
        if (!isMobile || activeMobileView === 'add-expense') {
          // 1. Desktop or Add Expense Tab: Pre-fill the manual form fields for review
          let fullDescription = parsedExpense.description || '';
          if (parsedExpense.merchant && parsedExpense.merchant !== 'Unknown') {
            if (!fullDescription.toLowerCase().includes(parsedExpense.merchant.toLowerCase())) {
              fullDescription = `${parsedExpense.merchant} - ${fullDescription}`;
            }
          }

          setManualForm({
            amount: parsedExpense.amount ? parsedExpense.amount.toString() : '',
            category: parsedExpense.category || 'Others',
            description: fullDescription,
            date: parsedExpense.date || new Date().toISOString().split('T')[0],
          });

          setQuickLogText('');
          showToast('AI command parsed! Review details in the form below.', 'info');
        } else {
          // 2. Mobile Home Tab: Directly log it into the database instantly
          const saveRes = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(parsedExpense),
          });

          if (saveRes.ok) {
            setQuickLogText('');
            fetchDashboardData();
            showToast('Expense logged instantly via AI!');
          } else {
            setError('Parsed successfully, but failed to save in database.');
          }
        }
      } else {
        setError('Could not understand Quick Log command.');
      }
    } catch (err) {
      console.error(err);
      setError('Quick log failed. Ensure backend server is responsive.');
    } finally {
      setQuickLogLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!token) return;
    setConfirmState({
      isOpen: true,
      title: 'Delete Transaction',
      message: 'Are you sure you want to permanently delete this transaction? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            fetchDashboardData();
            showToast('Transaction deleted successfully');
          } else {
            showToast('Failed to delete transaction', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('An error occurred while deleting', 'error');
        }
      }
    });
  };

  const handleCreateGoal = async (goal) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/savings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create savings goal');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoalFunding = async (id, newAmount) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/savings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentAmount: newAmount }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to update goal funding');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!token) return;
    setConfirmState({
      isOpen: true,
      title: 'Delete Savings Goal',
      message: 'Are you sure you want to delete this savings goal? Your saved progress details for this vault will be removed.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/savings/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchDashboardData();
            showToast('Savings goal deleted successfully');
          } else {
            const errorData = await res.json();
            setError(errorData.error || 'Failed to delete goal');
            showToast('Failed to delete savings goal', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('An error occurred while deleting', 'error');
        }
      }
    });
  };

  const handleUpdateBudget = async (category, customAmount = null) => {
    if (!token) return;
    const rawVal = customAmount !== null ? customAmount : editingBudget[category];
    const limitAmount = parseFloat(rawVal);
    if (isNaN(limitAmount) || limitAmount < 0) return;

    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          limitAmount,
          month: selectedMonth,
        }),
      });

      if (res.ok) {
        fetchDashboardData();
        showToast(`Budget updated for ${category}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for current month's transactions
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const totalSpending = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalVaultBalance = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const overallBudgetMatch = budgets.find((b) => b.category === 'Overall');
  const totalBudget = overallBudgetMatch
    ? overallBudgetMatch.limitAmount
    : budgets.reduce((sum, b) => sum + (b.category !== 'Overall' ? b.limitAmount : 0), 0);
  const remainingBudget = totalBudget - totalSpending;

  // Timeframe filter logic
  const todayStr = new Date().toISOString().split('T')[0];
  const getFilteredExpenses = () => {
    const now = new Date();
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      if (timeframe === 'Daily') {
        return exp.date === todayStr;
      }
      if (timeframe === 'Weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return expDate >= oneWeekAgo && expDate <= now;
      }
      // Monthly
      return exp.date.startsWith(selectedMonth);
    });
  };

  const currentFilteredExpenses = getFilteredExpenses();
  const filteredTotalSpending = currentFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Grouped category values
  const categorySpending = CATEGORIES.reduce((acc, cat) => {
    const sum = currentMonthExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    acc[cat] = sum;
    return acc;
  }, {});

  // Find top category
  let topCategory = 'None';
  let topAmount = 0;
  Object.entries(categorySpending).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  // SVG Chart Computations (Donut Chart)
  const donutData = Object.entries(categorySpending)
    .filter(([_, amt]) => amt > 0)
    .map(([cat, amt]) => ({ name: cat, value: amt }));

  // Grouped category values for selected timeframe
  const filteredCategorySpending = CATEGORIES.reduce((acc, cat) => {
    const sum = currentFilteredExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    acc[cat] = sum;
    return acc;
  }, {});

  // Find top category for selected timeframe
  let filteredTopCategory = 'None';
  let filteredTopAmount = 0;
  Object.entries(filteredCategorySpending).forEach(([cat, amt]) => {
    if (amt > filteredTopAmount) {
      filteredTopAmount = amt;
      filteredTopCategory = cat;
    }
  });

  // SVG Chart Computations (Donut Chart) for selected timeframe
  const filteredDonutData = Object.entries(filteredCategorySpending)
    .filter(([_, amt]) => amt > 0)
    .map(([cat, amt]) => ({ name: cat, value: amt }));

  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
    'var(--chart-7)',
    'var(--chart-8)',
  ];


  // Dynamic Weekly Stats
  const spentLast7Days = expenses
    .filter((e) => {
      const expDate = new Date(e.date + 'T00:00:00');
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      oneWeekAgo.setHours(0, 0, 0, 0);
      return expDate >= oneWeekAgo;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Dynamic Top Category for Last 7 Days
  const last7DaysExpenses = expenses.filter((e) => {
    const expDate = new Date(e.date + 'T00:00:00');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    return expDate >= oneWeekAgo;
  });

  const last7DaysCategoryTotals = {};
  last7DaysExpenses.forEach((exp) => {
    last7DaysCategoryTotals[exp.category] = (last7DaysCategoryTotals[exp.category] || 0) + exp.amount;
  });

  let topCategory7d = 'None';
  let topCategory7dAmount = 0;
  Object.entries(last7DaysCategoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategory7dAmount) {
      topCategory7dAmount = amt;
      topCategory7d = cat;
    }
  });

  // Spending percentage vs Budget
  const spendPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpending / totalBudget) * 100)) : 0;
  const savingsPercent = totalBudget > 0 ? Math.max(0, Math.min(100, Math.round((remainingBudget / totalBudget) * 100))) : 100;

  // SVG circular goals ring values
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (savingsPercent / 100) * circumference;

  return {
    token,
    user,
    logout,
    expenses,
    savingsGoals,
    budgets,
    manualForm,
    setManualForm,
    quickLogText,
    setQuickLogText,
    quickLogLoading,
    isScannerOpen,
    setIsScannerOpen,
    isChatOpen,
    setIsChatOpen,
    selectedMonth,
    setSelectedMonth,
    error,
    setError,
    editingBudget,
    setEditingBudget,
    activeMobileView,
    setActiveMobileView,
    timeframe,
    setTimeframe,
    historySearch,
    setHistorySearch,
    historyCategory,
    setHistoryCategory,
    fetchDashboardData,
    handleManualSubmit,
    handleQuickLog,
    handleDeleteExpense,
    handleUpdateBudget,
    handleCreateGoal,
    handleUpdateGoalFunding,
    handleDeleteGoal,
    currentMonthExpenses,
    totalSpending,
    totalVaultBalance,
    overallBudgetMatch,
    totalBudget,
    remainingBudget,
    categorySpending,
    topCategory,
    donutData,
    chartColors,
    currentFilteredExpenses,
    filteredTotalSpending,
    spentLast7Days,
    topCategory7d,
    topCategory7dAmount,
    spendPercent,
    savingsPercent,
    radius,
    circumference,
    strokeDashoffset,
    theme,
    toggleTheme,
    toasts,
    showToast,
    removeToast,
    confirmState,
    setConfirmState,
    isOnboardingOpen,
    setIsOnboardingOpen,
    filteredCategorySpending,
    filteredTopCategory,
    filteredDonutData,
  };
};
