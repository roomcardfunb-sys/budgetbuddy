import "./App.css";
import { useState } from "react";

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomes, setIncomes] = useState([]);

  const totalExpense = expenses.reduce(
    (total, item) => total + item.amount,
    0
  );
  const totalIncome = incomes.reduce(
    (total, item) => total + item.amount,
    0
  );

  const addExpense = () => {
    if (expenseName === "" || expenseAmount === "") {
      alert("Please enter expense name and amount");
      return;
    }

    const newExpense = {
      name: expenseName,
      amount: Number(expenseAmount),
    };

    const addIncome = () => {
      if (incomeName === "" || incomeAmount === "") {
      alert("Please enter income name and amount");
      return;
    }

    setIncomeAmount(Number(incomeAmount));
    setIncomeName("");
    };

    setExpenses([...expenses, newExpense]);
    setExpenseName("");
    setExpenseAmount("");
  };
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

  return (
    <>
      <header className="dashboard-header">
        <h1>Budget Buddy</h1>

        <nav className="navbar">
          <a href="#">Dashboard</a>
          <a href="#">Income</a>
          <a href="#">Expense</a>
          <button onClick={onLogout}>Logout</button>
        </nav>
      </header>

      <div className="dashboard">
        <h2>Dashboard</h2>

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
            <p>₹{totalIncome - totalExpense}</p>
          </div>
        </div>

        <h2>Add Income</h2>

<input
  type="text"
  placeholder="Income Name"
  value={incomeName}
  onChange={(e) => setIncomeName(e.target.value)}
/>

<input
  type="number"
  placeholder="Amount"
  value={incomeAmount}
  onChange={(e) => setIncomeAmount(e.target.value)}
/>

<button onClick={addIncome}>Add Income</button>

<h2>Income History</h2>

<ul>
  {incomes.map((item, index) => (
    <li key={index}>
  {item.name} - ₹{item.amount}

  <button
    onClick={() => {
      const updatedIncomes = incomes.filter(
        (_, i) => i !== index
      );
      setIncomes(updatedIncomes);
    }}
  >
    Delete
  </button>
</li>
  ))}
</ul>

<h2>Add Expense</h2>

        <input
          type="text"
          placeholder="Expense Name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
        />

        <button onClick={addExpense}>Add Expense</button>

        <h2>Expense History</h2>

        <ul>
          {expenses.map((item, index) => (
            <li key={index}>
  {item.name} - ₹{item.amount}

  <button
    onClick={() => {
      const updatedExpenses = expenses.filter(
        (_, i) => i !== index
      );
      setExpenses(updatedExpenses);
    }}
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