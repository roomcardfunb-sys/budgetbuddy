import "./App.css";
import { useState } from "react";

function Dashboard({ onLogout }) {

  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedMonth, setSelectedMonth] = useState("");

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
  const [monthlyBudget, setMonthlyBudget] = useState("");

  // Editing states
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Total Income
  const totalIncome = incomes.reduce(
    (total, item) => total + item.amount,
    0
  );

  // Total Expense
  const totalExpense = expenses.reduce(
    (total, item) => total + item.amount,
    0
  );

  // Remaining Budget
  const remainingBudget = monthlyBudget - totalExpense;

  // Budget Percentage
  const budgetPercentage =
    monthlyBudget > 0
      ? (totalExpense / monthlyBudget) * 100
      : 0;

  // Category-wise Expense
  const categoryTotals = {};

  expenses.forEach((item) => {
    const category = item.category || "Other";

    if (categoryTotals[category]) {
      categoryTotals[category] += item.amount;
    } else {
      categoryTotals[category] = item.amount;
    }
  });

  // Recent Transactions
  const recentTransactions = [
    ...incomes.map((item) => ({
      name: item.name,
      amount: item.amount,
      date: item.date,
      type: "Income",
    })),

    ...expenses.map((item) => ({
      name: item.name,
      amount: item.amount,
      date: item.date,
      type: "Expense",
    })),
  ];

  // Monthly Analysis
  const monthlyIncomes = incomes.filter(
    (item) =>
      item.date && item.date.startsWith(selectedMonth)
  );

  const monthlyExpenses = expenses.filter(
    (item) =>
      item.date && item.date.startsWith(selectedMonth)
  );

  const monthlyIncome = monthlyIncomes.reduce(
    (total, item) => total + item.amount,
    0
  );

  const monthlyExpense = monthlyExpenses.reduce(
    (total, item) => total + item.amount,
    0
  );

  const monthlyBalance = monthlyIncome - monthlyExpense;

  // =========================
  // ADD INCOME
  // =========================

  const addIncome = () => {
    if (incomeName === "" || incomeAmount === "") {
      alert("Please enter income name and amount");
      return;
    }

    const newIncome = {
      name: incomeName,
      amount: Number(incomeAmount),
      date: incomeDate,
    };

    setIncomes([...incomes, newIncome]);

    setIncomeName("");
    setIncomeAmount("");
    setIncomeDate("");
  };

  // =========================
  // EDIT INCOME
  // =========================

  const editIncome = (index) => {
    setEditingIncome(index);
    setIncomeName(incomes[index].name);
    setIncomeAmount(incomes[index].amount);
    setIncomeDate(incomes[index].date);
  };

  // =========================
  // UPDATE INCOME
  // =========================

  const updateIncome = () => {
    if (incomeName === "" || incomeAmount === "") {
      alert("Please enter income name and amount");
      return;
    }

    const updatedIncomes = [...incomes];

    updatedIncomes[editingIncome] = {
      name: incomeName,
      amount: Number(incomeAmount),
      date: incomeDate,
    };

    setIncomes(updatedIncomes);

    setEditingIncome(null);
    setIncomeName("");
    setIncomeAmount("");
    setIncomeDate("");
  };

  // =========================
  // DELETE INCOME
  // =========================

  const deleteIncome = (index) => {
    const updatedIncomes = incomes.filter(
      (_, i) => i !== index
    );

    setIncomes(updatedIncomes);
  };

  // =========================
  // ADD EXPENSE
  // =========================

  const addExpense = () => {
    if (
      expenseName === "" ||
      expenseCategory === "" ||
      expenseAmount === "" ||
      expenseDate === ""
    ) {
      alert(
        "Please enter expense name, category, amount and date"
      );
      return;
    }

    const newExpense = {
      name: expenseName,
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
    };

    setExpenses([...expenses, newExpense]);

    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseDate("");
  };

  // =========================
  // EDIT EXPENSE
  // =========================

  const editExpense = (index) => {
    setEditingExpense(index);

    setExpenseName(expenses[index].name);
    setExpenseAmount(expenses[index].amount);
    setExpenseDate(expenses[index].date);
    setExpenseCategory(expenses[index].category);
  };

  // =========================
  // UPDATE EXPENSE
  // =========================

  const updateExpense = () => {
    if (
      expenseName === "" ||
      expenseCategory === "" ||
      expenseAmount === "" ||
      expenseDate === ""
    ) {
      alert(
        "Please enter expense name, category, amount and date"
      );
      return;
    }

    const updatedExpenses = [...expenses];

    updatedExpenses[editingExpense] = {
      name: expenseName,
      amount: Number(expenseAmount),
      category: expenseCategory,
      date: expenseDate,
    };

    setExpenses(updatedExpenses);

    setEditingExpense(null);
    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseDate("");
  };

  // =========================
  // DELETE EXPENSE
  // =========================

  const deleteExpense = (index) => {
    const updatedExpenses = expenses.filter(
      (_, i) => i !== index
    );

    setExpenses(updatedExpenses);
  };

  // =========================
  // RETURN / UI
  // =========================

  return (
    <>
      {/* Header */}

      <header className="dashboard-header">

        <h1>Budget Buddy</h1>

        <nav className="navbar">

          <a
            href="#"
            onClick={() => setActivePage("Dashboard")}
          >
            Dashboard
          </a>

          <a
            href="#"
            onClick={() => setActivePage("Income")}
          >
            Income
          </a>

          <a
            href="#"
            onClick={() => setActivePage("Expense")}
          >
            Expense
          </a>

          <button onClick={onLogout}>
            Logout
          </button>

        </nav>

      </header>

      {/* Main Dashboard */}

      <div className="dashboard">

        {/* =========================
            DASHBOARD SECTION
        ========================= */}

        {activePage === "Dashboard" && (
          <>

            <h2>Dashboard</h2>

            {/* Summary Cards */}

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
                <p>
                  ₹{totalIncome - totalExpense}
                </p>
              </div>

              <div className="card">
                <h3>Remaining Budget</h3>
                <p>₹{remainingBudget}</p>
              </div>

            </div>

            {/* Budget Progress */}

            <div className="budget-progress">

              <h3>Budget Usage</h3>

              <p>
                ₹{totalExpense} / ₹{monthlyBudget || 0}
              </p>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      budgetPercentage,
                      100
                    )}%`,
                  }}
                ></div>

              </div>

              <p>
                {budgetPercentage.toFixed(1)}% Used
              </p>

            </div>

            {/* Monthly Budget */}

            <h2>Set Monthly Budget</h2>

            <input
              type="number"
              placeholder="Enter Monthly Budget"
              value={monthlyBudget}
              onChange={(e) =>
                setMonthlyBudget(e.target.value)
              }
            />

            {/* Category-wise Expense */}

            <h2>Category-wise Expense</h2>

            <ul>

              {Object.entries(categoryTotals).map(
                ([category, amount]) => (
                  <li key={category}>
                    {category} - ₹{amount}
                  </li>
                )
              )}

            </ul>

            {/* Recent Transactions */}

            <h2>Recent Transactions</h2>

            <ul>

              {recentTransactions.map(
                (item, index) => (
                  <li key={index}>
                    {item.name} - ₹{item.amount} -{" "}
                    {item.type} - {item.date}
                  </li>
                )
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

        {/* =========================
            INCOME SECTION
        ========================= */}

        {activePage === "Income" && (
          <>

            <h2>Add Income</h2>

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

            {editingIncome !== null ? (
              <button onClick={updateIncome}>
                Update Income
              </button>
            ) : (
              <button onClick={addIncome}>
                Add Income
              </button>
            )}

            {/* Income History */}

            <h2>Income History</h2>

            <ul>

              {incomes.map((item, index) => (
                <li key={index}>

                  {item.name} - ₹{item.amount} -{" "}
                  {item.date}

                  <button
                    onClick={() =>
                      editIncome(index)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteIncome(index)
                    }
                  >
                    Delete
                  </button>

                </li>
              ))}

            </ul>

          </>
        )}

        {/* =========================
            EXPENSE SECTION
        ========================= */}

        {activePage === "Expense" && (
          <>

            <h2>Add Expense</h2>

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

            {editingExpense !== null ? (
              <button onClick={updateExpense}>
                Update Expense
              </button>
            ) : (
              <button onClick={addExpense}>
                Add Expense
              </button>
            )}

            {/* Expense History */}

            <h2>Expense History</h2>

            <ul>

              {expenses.map((item, index) => (
                <li key={index}>

                  {item.name} - {item.category} - ₹
                  {item.amount} - {item.date}

                  <button
                    onClick={() =>
                      editExpense(index)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteExpense(index)
                    }
                  >
                    Delete
                  </button>

                </li>
              ))}

            </ul>

          </>
        )}

      </div>
    </>
  );
}

export default Dashboard;