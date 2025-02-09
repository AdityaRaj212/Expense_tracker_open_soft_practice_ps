import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { useAuth } from "../context/AuthContext";
import { Pie } from 'react-chartjs-2';
import Loading from "./Loading";
import AdminNavbar from "../components/AdminNavbar";

const AdminAnalytics = () => {
  const { apiUrl, loading, user } = useAuth();
  const [analytics, setAnalytics] = useState({});
  const [usersExpenses, setUsersExpenses] = useState([]);
  const [expensesByDate, setExpensesByDate] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filteredExpensesByDay, setFilteredExpensesByDay] = useState({});
  const [displayOption, setDisplayOption] = useState("count"); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [topSpenders, setTopSpenders] = useState([]);
  const [avgExpense, setAvgExpense] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);


  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterExpensesByMonth();
  }, [selectedMonth, expensesByDate, displayOption]); 

  useEffect(() => {
    if (Object.keys(expensesByCategory).length > 0) {
      renderPieChart(expensesByCategory);
    }
  }, [expensesByCategory]); 

  useEffect(() => {
    filterExpensesByYear();
  }, [selectedYear, expensesByDate]);

  const filterExpensesByYear = () => {
    if (!expensesByDate || Object.keys(expensesByDate).length === 0) return;
  
    const monthlyData = Array(12).fill(0); 
  
    Object.entries(expensesByDate).forEach(([dateKey, expenses]) => {
      const expenseDate = new Date(dateKey);
      const year = expenseDate.getFullYear();
      const month = expenseDate.getMonth(); 
  
      if (year === selectedYear) {
        monthlyData[month] += expenses.length;
      }
    });
  
    setExpensesByMonth(monthlyData);
    renderLineChart(monthlyData);
  };

  const fetchAnalytics = async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem("token");

      const [usersRes, expensesRes, netRes, usersExpensesRes, expensesByDateRes, expensesByCategoryRes, incomeExpenseRes, topSpendersRes, avgExpenseRes] = await Promise.all([
        axios.get(apiUrl + "/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/total-expenses", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/net", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/users/all-expenses", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/by-date", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/by-category", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/income-expense", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/top-spenders", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(apiUrl + "/api/admin/average-expense", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setAnalytics({
        totalUsers: usersRes.data.totalUsers,
        activeUsers: usersRes.data.activeUsers,
        totalExpenses: expensesRes.data.totalExpenses,
        income: incomeExpenseRes.data.totalIncome,
        expense: incomeExpenseRes.data.totalExpense,
        netAmount: netRes.data.netAmount,
      });
      setUsersExpenses(usersExpensesRes.data.users);
      setExpensesByDate(expensesByDateRes.data.expensesByDate);
      setExpensesByCategory(expensesByCategoryRes.data.expensesByCategory);
      setTopSpenders(topSpendersRes.data);
      setAvgExpense(parseFloat(avgExpenseRes.data.avgExpensePerUser).toFixed(2));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const incomeExpenseData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [analytics.income, analytics.expense],
        backgroundColor: ['#4CAF50', '#F44336'], // Green for income, Red for expenses
        hoverBackgroundColor: ['#388E3C', '#D32F2F']
      }
    ]
  };

  const spendersData = {
    labels: topSpenders?.map((spender) => spender.name),
    datasets: [
      {
        data: topSpenders?.map((spender) => spender.totalSpent),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#F44336"],
      },
    ],
  };
  

  // Function to filter expenses based on the selected month
  const filterExpensesByMonth = () => {
    if (!expensesByDate || Object.keys(expensesByDate).length === 0) return;

    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, selectedMonth, 0).getDate();

    const filteredData = {};
    for (let day = 1; day <= daysInMonth; day++) {
      filteredData[day] = { count: 0, amount: 0 };
    }

    Object.entries(expensesByDate).forEach(([dateKey, expenses]) => {
      const expenseDate = new Date(dateKey);
      const month = expenseDate.getMonth() + 1;
      const day = expenseDate.getDate();

      if (month === selectedMonth) {
        filteredData[day].count += expenses.length;
        filteredData[day].amount += expenses.reduce((sum, exp) => sum + exp.amount, 0);
      }
    });

    setFilteredExpensesByDay(filteredData);
    renderBarChart(filteredData);
  };

  // Function to render Bar Chart
  const renderBarChart = (data) => {
    const ctx = document.getElementById("expensesBarChart");
    if (ctx) {
      if (ctx.chart) ctx.chart.destroy(); // Prevent duplicate charts

      const labels = Object.keys(data).map((day) => `Day ${day}`);
      const countData = Object.values(data).map((entry) => entry.count);
      const amountData = Object.values(data).map((entry) => entry.amount);

      const datasets = [];
      if (displayOption === "count" || displayOption === "both") {
        datasets.push({
          label: "No. of Expenses",
          data: countData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        });
      }
      if (displayOption === "amount" || displayOption === "both") {
        datasets.push({
          label: "Total Amount Spent",
          data: amountData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        });
      }

      ctx.chart = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { ticks: { color: "#fff" } }, y: { ticks: { color: "#fff" }, beginAtZero: true } },
          plugins: { legend: { labels: { color: "#fff" } } },
        },
      });
    }
  };

  const renderLineChart = (data) => {
    const ctx = document.getElementById("monthlyExpensesLineChart");
    if (ctx) {
      if (ctx.chart) ctx.chart.destroy();
  
      ctx.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("en", { month: "short" })),
          datasets: [
            {
              label: `Number of Expenses in ${selectedYear}`,
              data: data,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
              tension: 0.4, // Smooth curve
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: "#fff" } },
            y: { ticks: { color: "#fff" }, beginAtZero: true },
          },
          plugins: { legend: { labels: { color: "#fff" } } },
        },
      });
    }
  };

  const renderPieChart = (data) => {
    const ctx = document.getElementById("expensesPieChart");
    if (ctx) {
      if (ctx.chart) ctx.chart.destroy(); // Prevent duplicate charts
  
      const labels = Object.keys(data);
      const counts = Object.values(data);
  
      ctx.chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "No. of Expenses",
              data: counts,
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
              ],
              borderColor: "#fff",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: "#fff" } } },
        },
      });
    }
  };
  
  if(loading || dataLoading) return(<Loading />);

  if(!loading && !user){
		return (<AuthPage />);
	}

  return (
    <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen ">
      <AdminNavbar />
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Admin Analytics Dashboard</h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: analytics.totalUsers },
          { title: "Active Users", value: analytics.activeUsers },
          { title: "Avg. Expense/User", value: '₹ ' + avgExpense },
          { title: "Total amount stored", value: '₹ ' + analytics.netAmount },
        ].map((item, index) => (
          <div
            key={index}
            className="relative bg-gradient-to-r from-gray-900 to-gray-700 p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gray-900 opacity-20 rounded-lg blur-lg"></div>
            
            <h3 className="text-xl font-semibold text-gray-300 relative z-10">
              {item.title}
            </h3>
            <p className="text-3xl font-bold text-white mt-2 relative z-10">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative bg-gradient-to-r from-purple-900 to-indigo-800 p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:shadow-2xl mt-4">
        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-purple-900 opacity-20 rounded-lg blur-lg"></div>

        <h3 className="text-xl font-semibold text-gray-300 relative z-10">🏆 Top Spenders</h3>

        <ul className="mt-4 space-y-3 relative z-10">
          {topSpenders?.length > 0 ? (
            topSpenders.map((spender, index) => {
              const rankBadges = ["🥇", "🥈", "🥉"]; // Gold, Silver, Bronze badges
              const isTopThree = index < 3;
              return (
                <li
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-md 
                  ${isTopThree ? "bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg" : "bg-gray-800"} 
                  hover:scale-105 transition-transform duration-200`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${isTopThree ? "text-yellow-300" : "text-gray-400"}`}>
                      {isTopThree ? rankBadges[index] : `#${index + 1}`}
                    </span>
                    <span className="text-gray-200 font-medium">{spender.name}</span>
                  </div>

                  {/* Amount Spent */}
                  <span className="font-bold text-green-400">₹{spender.totalSpent}</span>
                </li>
              );
            })
          ) : (
            <p className="text-gray-400 italic">No data available</p>
          )}
        </ul>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

      </div>
        {/* Expenses by Day Bar Chart */}
        <div className="bg-gray-800 mt-8 p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold mb-4">Expenses Per Day</h3>

          {/* Radio Buttons for Display Option */}
          <div className="mb-4 flex gap-4">
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { value: "count", label: "Show No. of Expenses" },
                { value: "amount", label: "Show Total Amount" },
                { value: "both", label: "Show Both" },
              ].map((option) => (
                <label key={option.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    checked={displayOption === option.value}
                    onChange={(e) => setDisplayOption(e.target.value)}
                    className="hidden peer"
                  />
                  <span className="px-4 py-2 text-sm font-medium rounded-full border border-gray-500 bg-gray-700 text-gray-300 peer-checked:bg-blue-500 peer-checked:text-white transition-all duration-300 ease-in-out hover:bg-gray-600 hover:border-gray-400">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

          </div>

          {/* Dropdown for Month Selection */}
          <select
            className="bg-gray-700 text-gray-100 p-2 rounded-md mb-4"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(0, index).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>

          {/* Chart Container */}
          <div className="w-full h-80">
            <canvas id="expensesBarChart"></canvas>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">

          <div className="w-full lg:w-3/4 bg-gray-800 mt-8 p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-4">Monthly Expenses for {selectedYear}</h3>
            
            <select
              className="bg-gray-700 text-gray-100 p-2 rounded-md mb-4"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[...Array(5)].map((_, index) => {
                const year = new Date().getFullYear() - index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            
            <div className="w-full h-80">
              <canvas id="monthlyExpensesLineChart"></canvas>
            </div>
          </div>

          {/* Expenses by Category Pie Chart */}
          <div className="w-full lg:w-1/4 bg-gray-800 mt-8 p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
            <div className="w-full h-80">
              <canvas id="expensesPieChart"></canvas>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/2 bg-gray-800 mt-8 p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-white">Expenses by Category</h3>
            <div className="w-full h-80 flex justify-center items-center">
              <Pie data={incomeExpenseData} />
            </div>
          </div>

          <div className="w-full lg:w-1/2 bg-gray-800 mt-8 p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-white">Top Spenders</h3>
            <div className="w-full h-80 flex justify-center items-center">
              <Pie data={spendersData} />
            </div>
          </div>
        </div>

    </div>
  );
};

export default AdminAnalytics;





// import React, { useState } from 'react';
// import Line_Chart from '../components/lineChart.jsx';
// import jsonData from "../components/analytic_data.json"
// import Histogram from '../components/histogram.jsx';
// import '../components/Dashboard.scss';

// const months = Object.keys(jsonData.monthly_expenses);

// export default function AdminAnalytics() {
//   const [selectedmonth, setselectedmonth] = useState(months[0]);
//   const analyticsdata = jsonData;

//   return (
//     <div className='dashboard'>
//       <h1 className='head1'>Expense Analytics</h1>

//       <div className='analytics'>
//         <div className='detail'>
//           <pre>
//             <span className='stat-label'>Total Users:</span> {analyticsdata.total_users}
//           </pre>
//         </div>
//       </div>

//       <div className='Graph'>
//         <select onChange={(e) => setselectedmonth(e.target.value)} value={selectedmonth}>
//           {months.map((month) => (
//             <option key={month} value={month}>
//               {month}
//             </option>
//           ))}
//         </select>

//         <div className="chart-container">
//           <Line_Chart month={selectedmonth} />
//         </div>
//         <div className="chart-container">
//           <Histogram />
//         </div>
//       </div>
//     </div>
//   );
// }
