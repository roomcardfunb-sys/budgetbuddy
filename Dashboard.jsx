import { useState } from "react";
import "./App.css";

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  // Expense states
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  // Income states
  const [incomes, setIncomes] = useState([]);
  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState("");

  // Budget
  const [monthlyBudget, setMonthlyBudget] = useState("");

  // Edit states
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Monthly analysis
  const [selectedMonth, setSelectedMonth] = useState("");

  // Totals
  const totalIncome = incomes.reduce(
    (total, income) => total + Number(income.amount),
    0
  );

  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const balance = totalIncome - totalExpense;

  const remainingBudget =
    Number(monthlyBudget || 0) - totalExpense;

  // Category-wise expense
  const categoryTotals = {};

  expenses.forEach((expense) => {
    if (categoryTotals[expense.category]) {
      categoryTotals[expense.category] += Number(
        expense.amount
      );
    } else {
      categoryTotals[expense.category] = Number(
        expense.amount
      );
    }
  });

  // Recent transactions
  const recentTransactions = [
    ...incomes.map((income) => ({
      ...income,
      type: "Income",
    })),

    ...expenses.map((expense) => ({
      ...expense,
      type: "Expense",
    })),
  ];

  // Monthly analysis
  const monthlyIncomes = incomes.filter(
    (income) =>
      selectedMonth &&
      income.date &&
      income.date.startsWith(selectedMonth)
  );

  const monthlyExpenses = expenses.filter(
    (expense) =>
      selectedMonth &&
      expense.date &&
      expense.date.startsWith(selectedMonth)
  );

  const monthlyIncome = monthlyIncomes.reduce(
    (total, income) => total + Number(income.amount),
    0
  );

  const monthlyExpense = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const monthlyBalance =
    monthlyIncome - monthlyExpense;

  // Add Income
  const addIncome = () => {
    if (!incomeName || !incomeAmount || !incomeDate) {
      alert("Please enter all income details");
      return;
    }

    const newIncome = {
      id: Date.now(),
      name: incomeName,
      amount: Number(incomeAmount),
      date: incomeDate,
    };

    setIncomes([...incomes, newIncome]);

    setIncomeName("");
    setIncomeAmount("");
    setIncomeDate("");
  };

  // Edit Income
  const editIncome = (income) => {
    setEditingIncome(income.id);
    setIncomeName(income.name);
    setIncomeAmount(income.amount);
    setIncomeDate(income.date);
  };

  // Update Income
  const updateIncome = () => {
    if (!incomeName || !incomeAmount || !incomeDate) {
      alert("Please enter all income details");
      return;
    }

    setIncomes(
      incomes.map((income) =>
        income.id === editingIncome
          ? {
              ...income,
              name: incomeName,
              amount: Number(incomeAmount),
              date: incomeDate,
            }
          : income
      )
    );

    setEditingIncome(null);
    setIncomeName("");
    setIncomeAmount("");
    setIncomeDate("");
  };

  // Delete Income
  const deleteIncome = (id) => {
    setIncomes(
      incomes.filter((income) => income.id !== id)
    );
  };

  // Add Expense
  const addExpense = () => {
    if (
      !expenseName ||
      !expenseCategory ||
      !expenseAmount ||
      !expenseDate
    ) {
      alert("Please enter all expense details");
      return;
    }

    const newExpense = {
      id: Date.now(),
      name: expenseName,
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
    };

    setExpenses([...expenses, newExpense]);

    setExpenseName("");
    setExpenseCategory("");
    setExpenseAmount("");
    setExpenseDate("");
  };

  // Edit Expense
  const editExpense = (expense) => {
    setEditingExpense(expense.id);
    setExpenseName(expense.name);
    setExpenseCategory(expense.category);
    setExpenseAmount(expense.amount);
    setExpenseDate(expense.date);
  };

  // Update Expense
  const updateExpense = () => {
    if (
      !expenseName ||
      !expenseCategory ||
      !expenseAmount ||
      !expenseDate
    ) {
      alert("Please enter all expense details");
      return;
    }

    setExpenses(
      expenses.map((expense) =>
        expense.id === editingExpense
          ? {
              ...expense,
              name: expenseName,
              category: expenseCategory,
              amount: Number(expenseAmount),
              date: expenseDate,
            }
          : expense
      )
    );

    setEditingExpense(null);
    setExpenseName("");
    setExpenseCategory("");
    setExpenseAmount("");
    setExpenseDate("");
  };

  // Delete Expense
  const deleteExpense = (id) => {
    setExpenses(
      expenses.filter((expense) => expense.id !== id)
    );
  };

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">
        <h1>Budget Buddy</h1>

        <nav className="navbar">

          <button
            onClick={() =>
              setActivePage("Dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              setActivePage("Income")
            }
          >
            Income
          </button>

          <button
            onClick={() =>
              setActivePage("Expense")
            }
          >
            Expense
          </button>

          <button onClick={onLogout}>
            Logout
          </button>

        </nav>
      </header>

      {/* Dashboard Page */}
      {activePage === "Dashboard" && (
        <>
          <h2>Dashboard</h2>

          {/* Cards */}
          <div className="card-container">

            <div className="card">
              <h3>Total Income</h3>
              <p>₹{totalIncome}</p>
            </div>

            <div className="card">
              <h3>Total Expense</h3>
              <p>₹{totalExpense}</p>
            </div>

            <div className="card">
              <h3>Balance</h3>
              <p>₹{balance}</p>
            </div>

            <div className="card">
              <h3>Remaining Budget</h3>
              <p>₹{remainingBudget}</p>
            </div>

          </div>

          {/* Monthly Budget */}
          <h2>Monthly Budget</h2>

          <input
            type="number"
            placeholder="Enter Monthly Budget"
            value={monthlyBudget}
            onChange={(e) =>
              setMonthlyBudget(e.target.value)
            }
          />

          {/* Budget Progress */}
          <div className="budget-progress">

            <h3>Budget Progress</h3>

            <p>
              ₹{totalExpense} / ₹
              {monthlyBudget || 0}
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width:
                    monthlyBudget > 0
                      ? `${Math.min(
                          (totalExpense /
                            monthlyBudget) *
                            100,
                          100
                        )}%`
                      : "0%",
                }}
              ></div>
            </div>

          </div>

          {/* Category-wise Expense */}
          <h2>Category-wise Expense</h2>

          <ul>
            {Object.keys(categoryTotals).length === 0 ? (
              <li>No expenses yet</li>
            ) : (
              Object.entries(categoryTotals).map(
                ([category, amount]) => (
                  <li key={category}>
                    {category} - ₹{amount}
                  </li>
                )
              )
            )}
          </ul>

          {/* Recent Transactions */}
          <h2>Recent Transactions</h2>

          <ul>
            {recentTransactions.length === 0 ? (
              <li>No transactions yet</li>
            ) : (
              recentTransactions
                .slice(-5)
                .reverse()
                .map((transaction, index) => (
                  <li key={index}>
                    {transaction.type === "Income"
                      ? `Income: ${transaction.name} - ₹${transaction.amount} - ${transaction.date}`
                      : `Expense: ${transaction.name} - ₹${transaction.amount} - ${transaction.date}`}
                  </li>
                ))
            )}
          </ul>

          {/* Monthly Analysis */}
          <h2>Monthly Analysis</h2>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
          />

          {selectedMonth && (
            <div className="monthly-analysis">

              <div className="card">
                <h3>Monthly Income</h3>
                <p>₹{monthlyIncome}</p>
              </div>

              <div className="card">
                <h3>Monthly Expense</h3>
                <p>₹{monthlyExpense}</p>
              </div>

              <div className="card">
                <h3>Monthly Balance</h3>
                <p>₹{monthlyBalance}</p>
              </div>

            </div>
          )}
        </>
      )}

      {/* Income Page */}
      {activePage === "Income" && (
        <>
          <h2>
            {editingIncome
              ? "Edit Income"
              : "Add Income"}
          </h2>

          <input
            type="text"
            placeholder="Income Name"
            value={incomeName}
            onChange={(e) =>
              setIncomeName(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Amount"
            value={incomeAmount}
            onChange={(e) =>
              setIncomeAmount(e.target.value)
            }
          />

          <input
            type="date"
            value={incomeDate}
            onChange={(e) =>
              setIncomeDate(e.target.value)
            }
          />

          {editingIncome ? (
            <button onClick={updateIncome}>
              Update Income
            </button>
          ) : (
            <button onClick={addIncome}>
              Add Income
            </button>
          )}

          <h2>Income History</h2>

          <ul>
            {incomes.length === 0 ? (
              <li>No income added</li>
            ) : (
              incomes.map((income) => (
                <li key={income.id}>
                  {income.name} - ₹{income.amount} -{" "}
                  {income.date}

                  <button
                    onClick={() =>
                      editIncome(income)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteIncome(income.id)
                    }
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}

      {/* Expense Page */}
      {activePage === "Expense" && (
        <>
          <h2>
            {editingExpense
              ? "Edit Expense"
              : "Add Expense"}
          </h2>

          <input
            type="text"
            placeholder="Expense Name"
            value={expenseName}
            onChange={(e) =>
              setExpenseName(e.target.value)
            }
          />

          <select
            value={expenseCategory}
            onChange={(e) =>
              setExpenseCategory(e.target.value)
            }
          >
            <option value="">
              Select Category
            </option>

            <option value="Food">
              Food
            </option>

            <option value="Travel">
              Travel
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

            <option value="Other">
              Other
            </option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={expenseAmount}
            onChange={(e) =>
              setExpenseAmount(e.target.value)
            }
          />

          <input
            type="date"
            value={expenseDate}
            onChange={(e) =>
              setExpenseDate(e.target.value)
            }
          />

          {editingExpense ? (
            <button onClick={updateExpense}>
              Update Expense
            </button>
          ) : (
            <button onClick={addExpense}>
              Add Expense
            </button>
          )}

          <h2>Expense History</h2>

          <ul>
            {expenses.length === 0 ? (
              <li>No expenses added</li>
            ) : (
              expenses.map((expense) => (
                <li key={expense.id}>

                  {expense.name} - ₹
                  {expense.amount} -{" "}
                  {expense.category} -{" "}
                  {expense.date}

                  <button
                    onClick={() =>
                      editExpense(expense)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteExpense(expense.id)
                    }
                  >
                    Delete
                  </button>

                </li>
              ))
            )}
          </ul>
        </>
      )}

    </div>
  );
}

export default Dashboard;