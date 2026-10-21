import { useEffect, useRef, useState } from "react";
import "./App.css";
import { apiRequest } from "./api";

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidAmount(value) {
  return value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) > 0;
}

function dueDateForMonth(payment, referenceDate = new Date()) {
  const monthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
  if (monthKey < payment.firstDueDate.slice(0, 7)) return null;
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = Math.min(Number(payment.dueDay), new Date(year, month + 1, 0).getDate());
  return new Date(year, month, day);
}

function formatDate(date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function prepareReceiptImage(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WEBP bill photo.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error("This image could not be opened. Try a JPG, PNG, or WEBP photo."); }
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let imageData = canvas.toDataURL("image/jpeg", 0.78);
  if (imageData.length > 2_900_000) imageData = canvas.toDataURL("image/jpeg", 0.58);
  if (imageData.length > 2_900_000) throw new Error("This bill photo is still too large after compression. Choose a smaller image.");
  return imageData;
}

function Dashboard({ onLogout, user }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [showHelp, setShowHelp] = useState(false);
  const [headerPanel, setHeaderPanel] = useState("");
  const [receiptViewer, setReceiptViewer] = useState("");
  const notificationReadStorageKey = `budget-buddy-read-notifications-${user?.id || user?.email || "member"}`;
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(notificationReadStorageKey) || "[]");
    } catch {
      return [];
    }
  });
  const profileInitial = user?.name?.trim()?.charAt(0).toUpperCase() || user?.email?.trim()?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    localStorage.setItem(notificationReadStorageKey, JSON.stringify(readNotificationIds));
  }, [notificationReadStorageKey, readNotificationIds]);

  useEffect(() => {
    if (!showHelp && !headerPanel && !receiptViewer) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setShowHelp(false);
        setHeaderPanel("");
        setReceiptViewer("");
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showHelp, headerPanel, receiptViewer]);

  useEffect(() => {
    if (!headerPanel) return undefined;
    const closeOnOutsideClick = (event) => {
      if (event.target instanceof Element && !event.target.closest(".header-menu-wrap")) {
        setHeaderPanel("");
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [headerPanel]);

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [paymentName, setPaymentName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentFirstDueDate, setPaymentFirstDueDate] = useState("");
  const [receiptImage, setReceiptImage] = useState("");
  const receiptFileRef = useRef(null);
  const [incomeAccountId, setIncomeAccountId] = useState("");
  const [expenseAccountId, setExpenseAccountId] = useState("");

  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState("");

  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/transactions"), apiRequest("/budget"), apiRequest("/accounts"), apiRequest("/recurring-payments")])
      .then(([records, budget, accountRecords, paymentRecords]) => {
        if (!active) return;
        setIncomes(records.filter((item) => item.type === "income"));
        setExpenses(records.filter((item) => item.type === "expense"));
        setMonthlyBudget(budget.amount ? String(budget.amount) : "");
        setAccounts(accountRecords);
        setRecurringPayments(paymentRecords);
      })
      .catch((error) => alert(error.message));
    return () => { active = false; };
  }, []);

  /* ================= TOTALS ================= */

  const totalIncome = incomes.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const totalExpense = expenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const balance = totalIncome - totalExpense;

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const currentMonthExpense = expenses
    .filter((item) => item.date.startsWith(currentMonth))
    .reduce((total, item) => total + Number(item.amount), 0);
  const remainingBudget = Number(monthlyBudget || 0) - currentMonthExpense;
  const budgetUsagePercent = Number(monthlyBudget) > 0 ? (currentMonthExpense / Number(monthlyBudget)) * 100 : 0;

  /* ================= ADD INCOME ================= */

  const addIncome = async () => {
    if (!incomeName.trim() || !isValidAmount(incomeAmount) || !isValidDate(incomeDate)) {
      alert("Enter an income name, a valid amount greater than zero, and a valid date.");
      return;
    }

    try {
      const newIncome = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify({
          type: "income",
          name: incomeName.trim(),
          amount: Number(incomeAmount),
          date: incomeDate,
          accountId: incomeAccountId || null,
        }),
      });

      setIncomes((items) => [...items, newIncome]);
      refreshAccountBalances();

      setIncomeName("");
      setIncomeAmount("");
      setIncomeDate("");

      setActivePage("Income");
    } catch (error) {
      alert(error.message);
    }
  };

  /* ================= DELETE INCOME ================= */

  const deleteIncome = async (id) => {
    try {
      await apiRequest(`/transactions/${id}`, { method: "DELETE" });
      setIncomes((items) => items.filter((item) => item.id !== id));
    } catch (error) { alert(error.message); }
  };

  /* ================= ADD EXPENSE ================= */

  const addExpense = async () => {
    if (
      !expenseName.trim() ||
      !expenseCategory ||
      !isValidAmount(expenseAmount) ||
      !isValidDate(expenseDate)
    ) {
      alert("Please fill all expense details");
      return;
    }

    try {
      const newExpense = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify({
          type: "expense",
          name: expenseName.trim(),
          category: expenseCategory,
          amount: Number(expenseAmount),
          date: expenseDate,
          accountId: expenseAccountId || null,
          receiptData: receiptImage || null,
        }),
      });

      setExpenses((items) => [...items, newExpense]);
      refreshAccountBalances();

      setExpenseName("");
      setExpenseCategory("");
      setExpenseAmount("");
      setExpenseDate("");
      setReceiptImage("");
      if (receiptFileRef.current) receiptFileRef.current.value = "";

      setActivePage("Expense");
    } catch (error) {
      alert(error.message);
    }
  };

  const viewExpenseReceipt = async (id) => {
    try {
      const { receiptData } = await apiRequest(`/transactions/${id}/receipt`);
      setReceiptViewer(receiptData);
    } catch (error) { alert(error.message); }
  };

  /* ================= DELETE EXPENSE ================= */

  const deleteExpense = async (id) => {
    try {
      await apiRequest(`/transactions/${id}`, { method: "DELETE" });
      setExpenses((items) => items.filter((item) => item.id !== id));
    } catch (error) { alert(error.message); }
  };

  const addAccount = async () => {
    const balanceValue = Number(openingBalance);
    if (!accountName.trim() || !Number.isFinite(balanceValue) || balanceValue < 0) {
      alert("Enter an account name and a valid opening balance.");
      return;
    }
    try {
      const account = await apiRequest("/accounts", { method: "POST", body: JSON.stringify({ name: accountName.trim(), type: accountType, openingBalance: balanceValue }) });
      setAccounts((items) => [...items, account]);
      setAccountName("");
      setOpeningBalance("0");
    } catch (error) { alert(error.message); }
  };

  const deleteAccount = async (id) => {
    if (!window.confirm("Remove this account? Its transactions will stay in your history without an account link.")) return;
    try {
      await apiRequest(`/accounts/${id}`, { method: "DELETE" });
      setAccounts((items) => items.filter((item) => item.id !== id));
      setIncomes((items) => items.map((item) => item.accountId === id ? { ...item, accountId: null } : item));
      setExpenses((items) => items.map((item) => item.accountId === id ? { ...item, accountId: null } : item));
      if (incomeAccountId === id) setIncomeAccountId("");
      if (expenseAccountId === id) setExpenseAccountId("");
    } catch (error) { alert(error.message); }
  };

  const refreshAccountBalances = async () => {
    try { setAccounts(await apiRequest("/accounts")); } catch (error) { alert(error.message); }
  };

  const addRecurringPayment = async () => {
    if (!paymentName.trim() || !isValidAmount(paymentAmount) || !isValidDate(paymentFirstDueDate)) {
      alert("Enter a payment name, a valid monthly amount, and its first due date.");
      return;
    }
    try {
      const payment = await apiRequest("/recurring-payments", {
        method: "POST",
        body: JSON.stringify({ name: paymentName.trim(), amount: Number(paymentAmount), firstDueDate: paymentFirstDueDate }),
      });
      setRecurringPayments((items) => [...items, payment].sort((a, b) => a.dueDay - b.dueDay));
      setPaymentName("");
      setPaymentAmount("");
      setPaymentFirstDueDate("");
    } catch (error) { alert(error.message); }
  };

  const deleteRecurringPayment = async (id) => {
    if (!window.confirm("Remove this monthly reminder?")) return;
    try {
      await apiRequest(`/recurring-payments/${id}`, { method: "DELETE" });
      setRecurringPayments((items) => items.filter((item) => item.id !== id));
    } catch (error) { alert(error.message); }
  };

  /* ================= CATEGORY TOTAL ================= */

  const categoryTotals = {};

  expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }

    categoryTotals[expense.category] += Number(expense.amount);
  });

  /* ================= MONTHLY ANALYSIS ================= */

  const monthlyIncomes = selectedMonth
    ? incomes.filter((item) =>
        item.date.startsWith(selectedMonth)
      )
    : [];

  const monthlyExpenses = selectedMonth
    ? expenses.filter((item) =>
        item.date.startsWith(selectedMonth)
      )
    : [];

  const monthlyIncome = monthlyIncomes.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const monthlyExpense = monthlyExpenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const monthlyBalance = monthlyIncome - monthlyExpense;

  /* ================= TRANSACTIONS ================= */

  const transactions = [
    ...incomes.map((item) => ({
      ...item,
      type: "Income",
    })),

    ...expenses.map((item) => ({
      ...item,
      type: "Expense",
    })),
  ].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  const recentTransactions = transactions.slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthlyPaymentReminders = recurringPayments.map((payment) => {
    const dueDate = dueDateForMonth(payment, today);
    if (!dueDate) return null;
    const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
    return { ...payment, dueDate, daysUntilDue };
  }).filter(Boolean);
  const urgentPaymentReminders = monthlyPaymentReminders.filter((payment) => payment.daysUntilDue <= 7);

  const notifications = [];
  if (Number(monthlyBudget) <= 0) {
    notifications.push({ id: `budget-${currentMonth}-unset`, title: "Set a monthly budget", message: "Choose a spending limit to track what remains.", page: "Analysis" });
  } else if (currentMonthExpense >= Number(monthlyBudget)) {
    notifications.push({ id: `budget-${currentMonth}-reached`, title: "Monthly budget reached", message: "Your expenses have reached or passed this month's limit.", page: "Analysis" });
  } else if (currentMonthExpense / Number(monthlyBudget) >= 0.8) {
    notifications.push({ id: `budget-${currentMonth}-near-${Math.round((currentMonthExpense / Number(monthlyBudget)) * 100)}`, title: "Close to your budget limit", message: `You've used ${Math.round((currentMonthExpense / Number(monthlyBudget)) * 100)}% of this month's budget.`, page: "Analysis" });
  }
  if (transactions.length === 0) {
    notifications.push({ id: `first-transaction-${user?.id || user?.email || "member"}`, title: "Add your first transaction", message: "Record income or an expense to start your money history.", page: "Income" });
  } else {
    const latestTransaction = transactions[0];
    notifications.push({ id: `recent-${latestTransaction.id}`, title: "Recent activity", message: `${latestTransaction.name} · ₹${latestTransaction.amount}`, page: "History" });
  }
  monthlyPaymentReminders.forEach((payment) => {
    const timing = payment.daysUntilDue < 0 ? `Overdue · due ${formatDate(payment.dueDate)}` : payment.daysUntilDue === 0 ? `Due today · ${formatDate(payment.dueDate)}` : `Due ${formatDate(payment.dueDate)}`;
    notifications.push({ id: `payment-${payment.id}-${payment.dueDate.toISOString().slice(0, 10)}`, title: `${payment.name} · ₹${Number(payment.amount).toLocaleString("en-IN")}`, message: `${timing} · monthly payment reminder`, page: "Recurring" });
  });
  const unreadNotificationCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const markNotificationsAsRead = (items) => {
    setReadNotificationIds((current) => {
      const updated = [...new Set([...current, ...items.map((item) => item.id)])];
      localStorage.setItem(notificationReadStorageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const requestLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) onLogout();
  };

  /* ================= NAVIGATION ================= */

  const menuItems = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "Income",
      icon: "↗",
    },
    {
      name: "Expense",
      icon: "↘",
    },
    {
      name: "History",
      icon: "☷",
    },
    {
      name: "Analysis",
      icon: "◔",
    },
    {
      name: "Accounts",
      icon: "▣",
    },
    {
      name: "Recurring",
      icon: "↻",
    },
  ];

  return (
    <div className="money-manager">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-logo">₹</div>

          <div>
            <h2>Budget Vision</h2>
            <span>Money Manager</span>
          </div>
        </div>

        <div className="sidebar-menu">

          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "side-link active"
                  : "side-link"
              }
              onClick={() => setActivePage(item.name)}
            >
              <span className="side-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </button>
          ))}

        </div>

        <div className="sidebar-bottom">

          <button className="sidebar-help" type="button" onClick={() => setShowHelp(true)} aria-haspopup="dialog">
            <div className="help-icon">?</div>

            <div>
              <strong>Need Help?</strong>
              <small>Manage your money easily</small>
            </div>
          </button>

          <button
            className="side-logout"
            onClick={requestLogout}
          >
            <span>⇥</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <div className="manager-main">

        {/* TOP BAR */}

        <header className="manager-header">

          <div>
            <h1>
              {activePage === "Dashboard"
                ? "Dashboard"
                : activePage}
            </h1>

            <p>
              {activePage === "Dashboard"
                ? "Here's your financial overview"
                : `Manage your ${activePage.toLowerCase()}`}
            </p>
          </div>

          <div className="header-user">
            <div className="header-menu-wrap">
              <button
                className={`notification${unreadNotificationCount ? " has-notifications" : ""}`}
                type="button"
                aria-label={`Notifications, ${unreadNotificationCount} unread`}
                aria-expanded={headerPanel === "notifications"}
                onClick={() => {
                  const opening = headerPanel !== "notifications";
                  if (opening) markNotificationsAsRead(notifications);
                  setHeaderPanel(opening ? "notifications" : "");
                }}
              >
                🔔
                {unreadNotificationCount > 0 && <span className="notification-count">{unreadNotificationCount}</span>}
              </button>
              {headerPanel === "notifications" && (
                <div className="header-popover notification-popover" role="region" aria-label="Notifications">
                  <div className="popover-heading"><strong>Notifications</strong><span>{unreadNotificationCount ? `${unreadNotificationCount} unread` : "All caught up"}</span></div>
                  {notifications.map((item) => (
                    <button className={`notification-item${readNotificationIds.includes(item.id) ? " is-read" : ""}`} type="button" key={item.id} onClick={() => { markNotificationsAsRead([item]); setActivePage(item.page); setHeaderPanel(""); }}>
                      {!readNotificationIds.includes(item.id) && <span className="notification-dot" />}
                      <span><strong>{item.title}</strong><small>{item.message}</small></span>
                    </button>
                  ))}
                  {notifications.length === 0 && <p className="notification-empty">You’re all caught up.</p>}
                </div>
              )}
            </div>
            <div className="header-menu-wrap">
              <button
                className="user-profile"
                type="button"
                aria-label="Open profile menu"
                aria-expanded={headerPanel === "profile"}
                onClick={() => setHeaderPanel((panel) => panel === "profile" ? "" : "profile")}
              >
                <span className="user-avatar">{profileInitial}</span>
                <span className="user-info"><strong>{user?.name || "Member"}</strong><small>{user?.email || "Personal Account"}</small></span>
              </button>
              {headerPanel === "profile" && (
                <div className="header-popover profile-popover" role="region" aria-label="Profile menu">
                  <div className="profile-popover-user">
                    <span className="user-avatar">{profileInitial}</span>
                    <span><strong>{user?.name || "Member"}</strong><small>{user?.email || "Personal Account"}</small></span>
                  </div>
                  <button className="profile-logout" type="button" onClick={() => { setHeaderPanel(""); requestLogout(); }}>⇥ <span>Log out</span></button>
                </div>
              )}
            </div>
          </div>

        </header>

        <main className="manager-content">

          {urgentPaymentReminders.length > 0 && (
            <section className="recurring-alert" role="status" aria-label="Upcoming recurring payment reminders">
              <div className="recurring-alert-heading"><span aria-hidden="true">◷</span><div><strong>EMI and monthly payment reminders</strong><small>Due within 7 days or overdue</small></div></div>
              <div className="recurring-alert-list">
                {urgentPaymentReminders.map((payment) => (
                  <div className="recurring-alert-item" key={payment.id}>
                    <span><strong>{payment.name}</strong><small>{payment.daysUntilDue < 0 ? `Overdue · due ${formatDate(payment.dueDate)}` : payment.daysUntilDue === 0 ? `Due today · ${formatDate(payment.dueDate)}` : `Due in ${payment.daysUntilDue} day${payment.daysUntilDue === 1 ? "" : "s"} · ${formatDate(payment.dueDate)}`}</small></span>
                    <strong>₹{Number(payment.amount).toLocaleString("en-IN")}</strong>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setActivePage("Recurring")}>View payments</button>
            </section>
          )}

          {Number(monthlyBudget) > 0 && budgetUsagePercent >= 80 && (
            <section className={`budget-alert ${budgetUsagePercent >= 100 ? "budget-alert-exceeded" : "budget-alert-near"}`} role={budgetUsagePercent >= 100 ? "alert" : "status"}>
              <span className="budget-alert-icon" aria-hidden="true">{budgetUsagePercent >= 100 ? "!" : "◔"}</span>
              <div className="budget-alert-copy">
                <strong>{budgetUsagePercent >= 100 ? "Monthly budget limit reached" : "You’re getting close to your monthly limit"}</strong>
                <p>
                  You’ve spent ₹{currentMonthExpense.toLocaleString("en-IN")} of ₹{Number(monthlyBudget).toLocaleString("en-IN")} this month.
                  {budgetUsagePercent >= 100 && ` You’re over by ₹${(currentMonthExpense - Number(monthlyBudget)).toLocaleString("en-IN")}.`}
                </p>
              </div>
              <button type="button" onClick={() => setActivePage("Analysis")}>View budget</button>
            </section>
          )}

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "Dashboard" && (
            <>

              {/* SUMMARY CARDS */}

              <section className="money-summary">

                <div className="money-card income-card">

                  <div className="money-card-top">
                    <div className="money-icon">
                      ↗
                    </div>

                    <span className="card-label">
                      INCOME
                    </span>
                  </div>

                  <h2>₹{totalIncome}</h2>

                  <p>
                    Total money received
                  </p>

                </div>


                <div className="money-card expense-card">

                  <div className="money-card-top">
                    <div className="money-icon">
                      ↘
                    </div>

                    <span className="card-label">
                      EXPENSE
                    </span>
                  </div>

                  <h2>₹{totalExpense}</h2>

                  <p>
                    Total money spent
                  </p>

                </div>


                <div className="money-card balance-card">

                  <div className="money-card-top">
                    <div className="money-icon">
                      ₹
                    </div>

                    <span className="card-label">
                      BALANCE
                    </span>
                  </div>

                  <h2>₹{balance}</h2>

                  <p>
                    Available balance
                  </p>

                </div>


                <div className="money-card budget-card">

                  <div className="money-card-top">
                    <div className="money-icon">
                      ◉
                    </div>

                    <span className="card-label">
                      BUDGET LEFT
                    </span>
                  </div>

                  <h2>₹{remainingBudget}</h2>

                  <p>
                    Remaining budget
                  </p>

                </div>

              </section>


              {/* QUICK ACTIONS */}

              <section className="quick-section">

                <div className="section-heading">
                  <div>
                    <h2>Quick Actions</h2>
                    <p>
                      Manage your money quickly
                    </p>
                  </div>
                </div>

                <div className="quick-grid">

                  <button
                    className="quick-box"
                    onClick={() =>
                      setActivePage("Income")
                    }
                  >
                    <div className="quick-icon income-bg">
                      +
                    </div>

                    <div>
                      <strong>Add Income</strong>
                      <span>Record new income</span>
                    </div>

                    <b>→</b>
                  </button>


                  <button
                    className="quick-box"
                    onClick={() =>
                      setActivePage("Expense")
                    }
                  >
                    <div className="quick-icon expense-bg">
                      −
                    </div>

                    <div>
                      <strong>Add Expense</strong>
                      <span>Record your spending</span>
                    </div>

                    <b>→</b>
                  </button>


                  <button
                    className="quick-box"
                    onClick={() =>
                      setActivePage("History")
                    }
                  >
                    <div className="quick-icon history-bg">
                      ☷
                    </div>

                    <div>
                      <strong>View History</strong>
                      <span>See all transactions</span>
                    </div>

                    <b>→</b>
                  </button>

                </div>

              </section>


              {/* TWO COLUMN AREA */}

              <section className="dashboard-columns">

                {/* RECENT TRANSACTIONS */}

                <div className="manager-panel">

                  <div className="panel-title">

                    <div>
                      <h2>Recent Transactions</h2>
                      <p>
                        Your latest financial activity
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setActivePage("History")
                      }
                    >
                      View All
                    </button>

                  </div>


                  {recentTransactions.length === 0 ? (

                    <div className="empty-box">
                      <div className="empty-icon">
                        ☷
                      </div>

                      <h3>No transactions yet</h3>

                      <p>
                        Add income or expenses to see them here.
                      </p>
                    </div>

                  ) : (

                    <div className="transaction-list">

                      {recentTransactions.map((item) => (

                        <div
                          className="manager-transaction"
                          key={item.id}
                        >

                          <div
                            className={
                              item.type === "Income"
                                ? "transaction-symbol income-symbol"
                                : "transaction-symbol expense-symbol"
                            }
                          >
                            {item.type === "Income"
                              ? "↗"
                              : "↘"}
                          </div>

                          <div className="transaction-info">

                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.category ||
                                "Income"}{" "}
                              • {item.date}
                            </span>

                          </div>

                          <strong
                            className={
                              item.type === "Income"
                                ? "amount-income"
                                : "amount-expense"
                            }
                          >
                            {item.type === "Income"
                              ? "+"
                              : "-"}
                            ₹{item.amount}
                          </strong>

                        </div>

                      ))}

                    </div>

                  )}

                </div>


                {/* EXPENSE CATEGORIES */}

                <div className="manager-panel">

                  <div className="panel-title">

                    <div>
                      <h2>Expense Categories</h2>
                      <p>
                        Where your money goes
                      </p>
                    </div>

                  </div>


                  {Object.keys(categoryTotals).length ===
                  0 ? (

                    <div className="empty-box small-empty">

                      <div className="empty-icon">
                        ◔
                      </div>

                      <h3>No expense data</h3>

                      <p>
                        Add expenses to see category analysis.
                      </p>

                    </div>

                  ) : (

                    <div className="category-list">

                      {Object.entries(categoryTotals).map(
                        ([category, amount]) => {

                          const percentage =
                            totalExpense > 0
                              ? (amount /
                                  totalExpense) *
                                100
                              : 0;

                          return (
                            <div
                              className="category-row"
                              key={category}
                            >

                              <div className="category-header">

                                <strong>
                                  {category}
                                </strong>

                                <span>
                                  ₹{amount}
                                </span>

                              </div>

                              <div className="category-bar">

                                <div
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />

                              </div>

                              <small>
                                {percentage.toFixed(0)}% of total expenses
                              </small>

                            </div>
                          );
                        }
                      )}

                    </div>

                  )}

                </div>

              </section>

            </>
          )}


          {/* =================================================
              INCOME
          ================================================= */}

          {activePage === "Income" && (

            <section className="page-container">

              <div className="page-intro">
                <div>
                  <span className="page-badge income-badge">
                    INCOME MANAGEMENT
                  </span>

                  <h2>Add Income</h2>

                  <p>
                    Record and manage the money you receive.
                  </p>
                </div>
              </div>


              <div className="manager-form-card">

                <div className="form-card-title">
                  <div className="form-title-icon income-bg">
                    +
                  </div>

                  <div>
                    <h3>New Income</h3>
                    <p>
                      Enter your income details below
                    </p>
                  </div>
                </div>


                <div className="modern-form-grid">

                  <div className="input-group">

                    <label>Income Name</label>

                    <input
                      type="text"
                      placeholder="Eg: Salary"
                      value={incomeName}
                      onChange={(e) =>
                        setIncomeName(e.target.value)
                      }
                    />

                  </div>

                  <div className="input-group">
                    <label>Account</label>
                    <select value={incomeAccountId} onChange={(e) => setIncomeAccountId(e.target.value)}>
                      <option value="">No account</option>
                      {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </select>
                  </div>


                  <div className="input-group">

                    <label>Amount</label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Eg: 25000"
                      value={incomeAmount}
                      onChange={(e) =>
                        setIncomeAmount(e.target.value)
                      }
                    />

                  </div>

                  <div className="input-group">

                    <label>Date</label>

                    <input
                      type="date"
                      value={incomeDate}
                      onChange={(e) =>
                        setIncomeDate(e.target.value)
                      }
                    />

                  </div>

                </div>


                <button
                  className="main-action-button income-button"
                  onClick={addIncome}
                >
                  + Add Income
                </button>

              </div>


              <div className="manager-panel full-panel">

                <div className="panel-title">

                  <div>
                    <h2>Income History</h2>
                    <p>
                      All recorded income
                    </p>
                  </div>

                  <span className="count-badge">
                    {incomes.length}
                  </span>

                </div>


                {incomes.length === 0 ? (

                  <div className="empty-box">
                    <div className="empty-icon">
                      ↗
                    </div>

                    <h3>No income added</h3>

                    <p>
                      Your income records will appear here.
                    </p>
                  </div>

                ) : (

                  <div className="history-list">

                    {incomes.map((item) => (

                      <div
                        className="history-item"
                        key={item.id}
                      >

                        <div className="history-left">

                          <div className="history-icon income-symbol">
                            ↗
                          </div>

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            <small>
                              {item.date}
                            </small>
                          </div>

                        </div>

                        <div className="history-right">

                          <strong className="amount-income">
                            + ₹{item.amount}
                          </strong>

                          <button
                            className="delete-text"
                            onClick={() =>
                              deleteIncome(item.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>
          )}


          {/* =================================================
              EXPENSE
          ================================================= */}

          {activePage === "Expense" && (

            <section className="page-container">

              <div className="page-intro">

                <div>

                  <span className="page-badge expense-badge">
                    EXPENSE MANAGEMENT
                  </span>

                  <h2>Add Expense</h2>

                  <p>
                    Track where your money is being spent.
                  </p>

                </div>

              </div>


              <div className="manager-form-card">

                <div className="form-card-title">

                  <div className="form-title-icon expense-bg">
                    −
                  </div>

                  <div>
                    <h3>New Expense</h3>

                    <p>
                      Enter your spending details below
                    </p>
                  </div>

                </div>


                <div className="modern-form-grid expense-form-grid">

                  <div className="input-group">

                    <label>Expense Name</label>

                    <input
                      type="text"
                      placeholder="Eg: Groceries"
                      value={expenseName}
                      onChange={(e) =>
                        setExpenseName(e.target.value)
                      }
                    />

                  </div>


                  <div className="input-group">

                    <label>Category</label>

                    <select
                      value={expenseCategory}
                      onChange={(e) =>
                        setExpenseCategory(e.target.value)
                      }
                    >

                      <option value="">
                        Select category
                      </option>

                      <option value="Food">
                        Food
                      </option>

                      <option value="Transport">
                        Transport
                      </option>

                      <option value="Shopping">
                        Shopping
                      </option>

                      <option value="Education">
                        Education
                      </option>

                      <option value="Bills">
                        Bills
                      </option>

                      <option value="Entertainment">
                        Entertainment
                      </option>

                      <option value="Health">
                        Health
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>

                  <div className="input-group">
                    <label>Account</label>
                    <select value={expenseAccountId} onChange={(e) => setExpenseAccountId(e.target.value)}>
                      <option value="">No account</option>
                      {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </select>
                  </div>


                  <div className="input-group">

                    <label>Amount</label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Eg: 500"
                      value={expenseAmount}
                      onChange={(e) =>
                        setExpenseAmount(e.target.value)
                      }
                    />

                  </div>


                  <div className="input-group">

                    <label>Date</label>

                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) =>
                        setExpenseDate(e.target.value)
                      }
                    />

                  </div>

                  <div className="input-group receipt-upload-group">
                    <label htmlFor="expense-receipt">Bill photo <span>(optional)</span></label>
                    <input
                      ref={receiptFileRef}
                      id="expense-receipt"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try { setReceiptImage(await prepareReceiptImage(file)); }
                        catch (error) { alert(error.message); event.target.value = ""; }
                      }}
                    />
                    <small className="receipt-upload-hint">JPG, PNG, or WEBP · up to 10 MB (compressed before saving)</small>
                    {receiptImage && <div className="receipt-preview"><img src={receiptImage} alt="Selected bill preview" /><span>Bill photo attached</span><button type="button" onClick={() => { setReceiptImage(""); if (receiptFileRef.current) receiptFileRef.current.value = ""; }}>Remove</button></div>}
                  </div>

                </div>


                <button
                  className="main-action-button expense-button"
                  onClick={addExpense}
                >
                  − Add Expense
                </button>

              </div>


              <div className="manager-panel full-panel">

                <div className="panel-title">

                  <div>
                    <h2>Expense History</h2>

                    <p>
                      All recorded expenses
                    </p>
                  </div>

                  <span className="count-badge">
                    {expenses.length}
                  </span>

                </div>


                {expenses.length === 0 ? (

                  <div className="empty-box">

                    <div className="empty-icon">
                      ↘
                    </div>

                    <h3>No expenses added</h3>

                    <p>
                      Your expense records will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="history-list">

                    {expenses.map((item) => (

                      <div
                        className="history-item"
                        key={item.id}
                      >

                        <div className="history-left">

                          <div className="history-icon expense-symbol">
                            ↘
                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <small>
                              {item.category} • {item.date}
                            </small>

                          </div>

                        </div>


                        <div className="history-right">

                          <strong className="amount-expense">
                            - ₹{item.amount}
                          </strong>

                          {item.hasReceipt && <button className="receipt-view-button" type="button" onClick={() => viewExpenseReceipt(item.id)}>View bill</button>}

                          <button
                            className="delete-text"
                            onClick={() =>
                              deleteExpense(item.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>
          )}


          {/* =================================================
              HISTORY
          ================================================= */}

          {activePage === "History" && (

            <section className="page-container">

              <div className="page-intro">

                <div>

                  <span className="page-badge">
                    TRANSACTION RECORDS
                  </span>

                  <h2>Transaction History</h2>

                  <p>
                    View all your income and expenses.
                  </p>

                </div>

              </div>


              <div className="manager-panel full-panel">

                <div className="panel-title">

                  <div>
                    <h2>All Transactions</h2>

                    <p>
                      Latest transactions appear first
                    </p>
                  </div>

                  <span className="count-badge">
                    {transactions.length}
                  </span>

                </div>


                {transactions.length === 0 ? (

                  <div className="empty-box">

                    <div className="empty-icon">
                      ☷
                    </div>

                    <h3>No transactions</h3>

                    <p>
                      Add income or expenses to create history.
                    </p>

                  </div>

                ) : (

                  <div className="history-list">

                    {transactions.map((item) => (

                      <div
                        className="history-item"
                        key={item.id}
                      >

                        <div className="history-left">

                          <div
                            className={
                              item.type === "Income"
                                ? "history-icon income-symbol"
                                : "history-icon expense-symbol"
                            }
                          >
                            {item.type === "Income"
                              ? "↗"
                              : "↘"}
                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <small>
                              {item.type}

                              {item.category
                                ? ` • ${item.category}`
                                : ""}

                              {" • "}

                              {item.date}
                            </small>

                          </div>

                        </div>


                        <div className="history-right">
                          {item.type === "Expense" && item.hasReceipt && <button className="receipt-view-button" type="button" onClick={() => viewExpenseReceipt(item.id)}>View bill</button>}
                          <strong
                            className={
                              item.type === "Income"
                                ? "amount-income"
                                : "amount-expense"
                            }
                          >
                            {item.type === "Income"
                              ? "+"
                              : "-"}
                            ₹{item.amount}
                          </strong>
                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>
          )}


          {/* =================================================
              ANALYSIS
          ================================================= */}

          {activePage === "Analysis" && (

            <section className="page-container">

              <div className="page-intro">

                <div>

                  <span className="page-badge">
                    FINANCIAL ANALYSIS
                  </span>

                  <h2>Financial Analysis</h2>

                  <p>
                    Understand your spending and budget.
                  </p>

                </div>

              </div>


              {/* BUDGET CARD */}

              <div className="budget-manager-card">

                <div className="budget-heading">

                  <div>

                    <h3>Monthly Budget</h3>

                    <p>
                      Set a spending limit for your month.
                    </p>

                  </div>

                  <div className="budget-icon-large">
                    ◉
                  </div>

                </div>


                <div className="budget-input">

                  <label>Monthly Budget</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter your budget"
                    value={monthlyBudget}
                    onChange={(e) =>
                      setMonthlyBudget(e.target.value)
                    }
                    onBlur={async () => {
                      if (monthlyBudget !== "" && Number(monthlyBudget) >= 0) {
                        try {
                          const saved = await apiRequest("/budget", {
                            method: "PUT",
                            body: JSON.stringify({ amount: Number(monthlyBudget) }),
                          });
                          setMonthlyBudget(String(saved.amount));
                        } catch (error) { alert(error.message); }
                      }
                    }}
                  />

                </div>


                <div className="budget-stats">

                  <div>
                    <span>Budget</span>
                    <strong>
                      ₹{monthlyBudget || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Spent</span>
                    <strong>
                      ₹{currentMonthExpense}
                    </strong>
                  </div>

                  <div>
                    <span>Remaining</span>
                    <strong>
                      ₹{remainingBudget}
                    </strong>
                  </div>

                </div>


                <div className="budget-progress">

                  <div className="budget-progress-header">

                    <span>
                      Budget used
                    </span>

                    <strong>
                      {monthlyBudget > 0
                        ? Math.min(
                            Math.round(
                              (currentMonthExpense /
                                Number(monthlyBudget)) *
                                100
                            ),
                            100
                          )
                        : 0}
                      %
                    </strong>

                  </div>

                  <div className="budget-track">

                    <div
                      className="budget-used"
                      style={{
                        width: `${
                          monthlyBudget > 0
                            ? Math.min(
                                (currentMonthExpense /
                                  Number(monthlyBudget)) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />

                  </div>

                </div>

              </div>


              {/* MONTHLY ANALYSIS */}

              <div className="manager-panel full-panel">

                <div className="panel-title">

                  <div>

                    <h2>Monthly Analysis</h2>

                    <p>
                      Check your financial performance by month.
                    </p>

                  </div>

                </div>


                <div className="month-selector">

                  <label>Select Month</label>

                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(e.target.value)
                    }
                  />

                </div>


                {selectedMonth ? (

                  <div className="monthly-result">

                    <div className="analysis-card">

                      <span>MONTHLY INCOME</span>

                      <strong className="amount-income">
                        ₹{monthlyIncome}
                      </strong>

                    </div>


                    <div className="analysis-card">

                      <span>MONTHLY EXPENSE</span>

                      <strong className="amount-expense">
                        ₹{monthlyExpense}
                      </strong>

                    </div>


                    <div className="analysis-card">

                      <span>MONTHLY BALANCE</span>

                      <strong className="amount-balance">
                        ₹{monthlyBalance}
                      </strong>

                    </div>

                  </div>

                ) : (

                  <div className="analysis-empty">

                    <div>◔</div>

                    <h3>Select a month</h3>

                    <p>
                      Choose a month above to view your analysis.
                    </p>

                  </div>

                )}

              </div>

            </section>
          )}

          {activePage === "Accounts" && (
            <section className="page-container">
              <div className="page-intro"><div><span className="page-badge">YOUR MONEY SOURCES</span><h2>Accounts</h2><p>Keep bank, wallet, cash, and savings balances in one place.</p></div></div>
              <div className="manager-form-card">
                <div className="form-card-title"><div className="form-title-icon income-bg">＋</div><div><h3>Add an account</h3><p>Enter its current starting balance to track it.</p></div></div>
                <div className="modern-form-grid account-form-grid">
                  <div className="input-group"><label>Account name</label><input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Eg: Main bank" maxLength={60} /></div>
                  <div className="input-group"><label>Account type</label><select value={accountType} onChange={(e) => setAccountType(e.target.value)}>{["Bank", "Savings", "Cash", "Credit Card", "Wallet", "Other"].map((type) => <option key={type}>{type}</option>)}</select></div>
                  <div className="input-group"><label>Opening balance (₹)</label><input type="number" min="0" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} /></div>
                </div>
                <button className="main-action-button income-button" type="button" onClick={addAccount}>+ Add account</button>
              </div>
              <div className="manager-panel full-panel accounts-panel">
                <div className="panel-title"><div><h2>Your accounts</h2><p>Balances update when you record an associated transaction.</p></div><span className="count-badge">{accounts.length}</span></div>
                {accounts.length === 0 ? <div className="analysis-empty"><div>▣</div><h3>No accounts yet</h3><p>Add a bank, wallet, savings, or cash account above.</p></div> : <div className="account-list">{accounts.map((account) => <article className="account-row" key={account.id}><span className="account-symbol">{account.type === "Cash" ? "₹" : "▣"}</span><div className="account-details"><strong>{account.name}</strong><small>{account.type} · Opening balance ₹{Number(account.openingBalance).toLocaleString("en-IN")}</small></div><strong className="account-balance">₹{Number(account.balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong><button type="button" className="account-remove" onClick={() => deleteAccount(account.id)} aria-label={`Remove ${account.name}`}>Remove</button></article>)}</div>}
                <button className="accounts-refresh" type="button" onClick={refreshAccountBalances}>Refresh balances</button>
              </div>
            </section>
          )}

          {activePage === "Recurring" && (
            <section className="page-container">
              <div className="page-intro"><div><span className="page-badge">MONTHLY REMINDERS</span><h2>Recurring payments</h2><p>Add EMIs, rent, subscriptions, or salary dates and get a monthly reminder.</p></div></div>
              <div className="manager-form-card">
                <div className="form-card-title"><div className="form-title-icon income-bg">↻</div><div><h3>Add a monthly payment</h3><p>We’ll remind you with its due date and amount each month.</p></div></div>
                <div className="modern-form-grid recurring-form-grid">
                  <div className="input-group"><label>Payment name</label><input value={paymentName} onChange={(e) => setPaymentName(e.target.value)} placeholder="Eg: Home loan EMI" maxLength={100} /></div>
                  <div className="input-group"><label>Monthly amount (₹)</label><input type="number" min="0.01" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Eg: 15000" /></div>
                  <div className="input-group"><label>First due date</label><input type="date" value={paymentFirstDueDate} onChange={(e) => setPaymentFirstDueDate(e.target.value)} /></div>
                </div>
                <button className="main-action-button income-button" type="button" onClick={addRecurringPayment}>+ Add monthly reminder</button>
              </div>
              <div className="manager-panel full-panel recurring-panel">
                <div className="panel-title"><div><h2>Your monthly reminders</h2><p>Each payment repeats on the same day of the month. Shorter months use their last day.</p></div><span className="count-badge">{recurringPayments.length}</span></div>
                {recurringPayments.length === 0 ? <div className="analysis-empty"><div>↻</div><h3>No recurring payments yet</h3><p>Add an EMI or bill above to get its monthly date and amount reminder.</p></div> : <div className="recurring-payment-list">{recurringPayments.map((payment) => {
                  const nextDueDate = dueDateForMonth(payment, today);
                  return <article className="recurring-payment-row" key={payment.id}><span className="recurring-payment-icon">↻</span><div className="recurring-payment-details"><strong>{payment.name}</strong><small>Every month · due day {payment.dueDay}{nextDueDate ? ` · next reminder ${formatDate(nextDueDate)}` : ` · starts ${formatDate(new Date(`${payment.firstDueDate}T00:00:00`))}`}</small></div><strong className="recurring-payment-amount">₹{Number(payment.amount).toLocaleString("en-IN")}<small>/ month</small></strong><button className="account-remove" type="button" onClick={() => deleteRecurringPayment(payment.id)}>Remove</button></article>;
                })}</div>}
              </div>
            </section>
          )}

        </main>

      </div>

      {receiptViewer && (
        <div className="receipt-viewer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReceiptViewer(""); }}>
          <section className="receipt-viewer" role="dialog" aria-modal="true" aria-label="Expense bill photo">
            <button type="button" className="receipt-viewer-close" aria-label="Close bill photo" onClick={() => setReceiptViewer("")}>×</button>
            <img src={receiptViewer} alt="Saved expense bill" />
          </section>
        </div>
      )}

      {showHelp && (
        <div className="help-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowHelp(false); }}>
          <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
            <button className="help-modal-close" type="button" aria-label="Close help" onClick={() => setShowHelp(false)}>×</button>
            <span className="help-modal-kicker">BUDGET VISION GUIDE</span>
            <h2 id="help-title">How can we help?</h2>
            <p className="help-modal-intro">A few quick tips to get the most from your money manager.</p>
            <div className="help-topic-list">
              <article><span>↗</span><div><strong>Add income</strong><p>Choose Income in the sidebar, enter the name, amount, and date, then save.</p></div></article>
              <article><span>↘</span><div><strong>Record an expense</strong><p>Choose Expense, select a category, add the amount and date, then save.</p></div></article>
              <article><span>◉</span><div><strong>Set a monthly budget</strong><p>Open Analysis, enter your budget, and leave the field to save it.</p></div></article>
              <article><span>↻</span><div><strong>Set an EMI reminder</strong><p>Open Recurring, add the payment amount and first due date, then see monthly reminders in Notifications.</p></div></article>
              <article><span>▤</span><div><strong>Review your records</strong><p>Use History for all transactions or Analysis to compare a selected month.</p></div></article>
            </div>
            <div className="help-modal-actions">
              <button type="button" className="help-modal-done" onClick={() => setShowHelp(false)}>Got it</button>
              <button type="button" className="help-modal-action" onClick={() => { setActivePage("Income"); setShowHelp(false); }}>Add income</button>
              <button type="button" className="help-modal-action" onClick={() => { setActivePage("Expense"); setShowHelp(false); }}>Add expense</button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
