import "./App.css";
import { useState } from "react";

function Dashboard({ onLogout }) {
  // Expense states
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  // Income states
  const [incomes, setIncomes] = useState([]);
  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");

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
    };

    setIncomes([...incomes, newIncome]);

    setIncomeName("");
    setIncomeAmount("");
  };

  // =========================
  // EDIT INCOME
  // =========================
  const editIncome = (index) => {
    setEditingIncome(index);
    setIncomeName(incomes[index].name);
    setIncomeAmount(incomes[index].amount);
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
    };

    setIncomes(updatedIncomes);

    setEditingIncome(null);
    setIncomeName("");
    setIncomeAmount("");
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
      expenseAmount === "" ||
      expenseDate === ""
    ) {
      alert("Please enter expense name, amount and date");
      return;
    }

    const newExpense = {
      name: expenseName,
      amount: Number(expenseAmount),
      date: expenseDate,
    };

    setExpenses([...expenses, newExpense]);

    setExpenseName("");
    setExpenseAmount("");
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
  };

  // =========================
  // UPDATE EXPENSE
  // =========================
  const updateExpense = () => {
    if (
      expenseName === "" ||
      expenseAmount === "" ||
      expenseDate === ""
    ) {
      alert("Please enter expense name, amount and date");
      return;
    }

    const updatedExpenses = [...expenses];

    updatedExpenses[editingExpense] = {
      name: expenseName,
      amount: Number(expenseAmount),
      date: expenseDate,
    };

    setExpenses(updatedExpenses);

    setEditingExpense(null);
    setExpenseName("");
    setExpenseAmount("");
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
          <a href="#">Dashboard</a>
          <a href="#">Income</a>
          <a href="#">Expense</a>

          <button onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Dashboard */}
      <div className="dashboard">

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

        </div>

        {/* =========================
            INCOME SECTION
        ========================= */}

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

              {item.name} - ₹{item.amount}

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

        {/* =========================
            EXPENSE SECTION
        ========================= */}

        <h2>Add Expense</h2>

        <input
          type="text"
          placeholder="Expense Name"
          value={expenseName}
          onChange={(e) =>
            setExpenseName(e.target.value)
          }
        />

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

              {item.name} - ₹{item.amount} - {item.date}

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

      </div>
    </>
  );
}

export default Dashboard;
