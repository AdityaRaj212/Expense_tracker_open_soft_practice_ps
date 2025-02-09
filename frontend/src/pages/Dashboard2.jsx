import { useState, useEffect } from "react";
import { useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Loading from "./Loading";
import AuthPage from "./AuthPage";

import { FiEdit3 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import AdminAnalytics from "./AdminAnalytics";

const UserDashboard = () => {
	const { apiUrl, loading, user } = useAuth();
	const [expenses, setExpenses] = useState([]);
	const [filterExpenses, setFilterExpenses] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [formData, setFormData] = useState({
		amount: "",
		type: "expense",
		description: "",
		category: "",
		paymentMethod: "online",
		date: new Date().toISOString().split("T")[0], // Default to today's date
	});
	const [filterData, setFilterData] = useState({
		dateFrom: "",
		dateTo: "",
		type: "",
		category: "",
		paymentMethod: "",
	});	
	const [expenseLoading, setExpenseLoading] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);

	// Fetch Expenses
	useEffect(() => {
		fetchExpenses();
	}, [loading]);

	const fetchExpenses = async () => {
		if (!loading && user) {
			const token = localStorage.getItem("token");
			try {
				setExpenseLoading(true);
				const response = await axios.get(apiUrl + "/api/expenses/list", {
					headers: { Authorization: `Bearer ${token}` },
				});
				setExpenses(response.data.expenses);
				setFilterExpenses(response.data.expenses);
			} catch (error) {
				toast.error("Failed to fetch expenses");
			} finally{
				setExpenseLoading(false);
			}
		}
	};
	const applyFilter = async () => {
		if (!loading && user) {
			
				let filteredExpenses = expenses;
				// setFilterExpenses(expenses);
	
				// Apply filters
				if (filterData.dateFrom) {
					filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) >= new Date(filterData.dateFrom));
				}
				if (filterData.dateTo) {
					filteredExpenses = filteredExpenses.filter(exp => new Date(exp.date) <= new Date(filterData.dateTo));
				}
				if (filterData.type) {
					filteredExpenses = filteredExpenses.filter(exp => exp.type === filterData.type);
				}
				if (filterData.category) {
					filteredExpenses = filteredExpenses.filter(exp => exp.category.toLowerCase().includes(filterData.category.toLowerCase()));
				}
				if (filterData.paymentMethod) {
					filteredExpenses = filteredExpenses.filter(exp => exp.paymentMethod === filterData.paymentMethod);
				}
	
				setFilterExpenses(filteredExpenses);
		}
	};

	const filteredExpenses = useMemo(() => {
		return expenses.filter(expense => {
			const expenseDate = new Date(expense.date);
			const fromDate = filterData.dateFrom ? new Date(filterData.dateFrom) : null;
			const toDate = filterData.dateTo ? new Date(filterData.dateTo) : null;
	
			return (!fromDate || expenseDate >= fromDate) && (!toDate || expenseDate <= toDate);
		});
	}, [expenses, filterData.dateFrom, filterData.dateTo]);
	
	const { cashIn, cashOut } = useMemo(() => {
		return filteredExpenses.reduce(
			(acc, expense) => {
				if (expense.type === "income") {
					acc.cashIn += expense.amount;
				} else {
					acc.cashOut += expense.amount;
				}
				return acc;
			},
			{ cashIn: 0, cashOut: 0 }
		);
	}, [filteredExpenses]);

	const netBalance = cashIn - cashOut;
	

	// Handle input change
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Open Modal for Adding/Editing
	const openModal = (expense = null) => {
		if (expense) {
			setEditingExpense(expense);
			setFormData({
				amount: expense.amount,
				type: expense.type,
				description: expense.description,
				category: expense.category,
				paymentMethod: expense.paymentMethod,
				date: new Date(expense.date).toISOString().split("T")[0],
			});
		} else {
			setEditingExpense(null);
			setFormData({
				amount: "",
				type: "expense",
				description: "",
				category: "",
				paymentMethod: "online",
				date: new Date().toISOString().split("T")[0],
			});
		}
		setShowModal(true);
	};

	// Close Modal (on click outside)
	const closeModal = () => {
		setShowModal(false);
		setEditingExpense(null);
	};

	// Add or Update Expense
	const handleSaveExpense = async (e) => {
		e.preventDefault();
		setExpenseLoading(true);

		try {
			const token = localStorage.getItem("token");
			if (editingExpense) {
				// Update expense
				console.log('type: ', formData.type);
				await axios.put(apiUrl + `/api/expenses/update/${editingExpense.id}`, {
					amount: formData.amount,
					type: formData.type,
					description: formData.description,
					category: formData.category,
					paymentMethod: formData.paymentMethod,
					date: formData.date,
					userId: user.id
				}, {
					headers: { Authorization: `Bearer ${token}` },
				});
				fetchExpenses();
				toast.success("Expense updated successfully!");
			} else {
				// Add new expense
				const response = await axios.post(apiUrl + "/api/expenses/add", {
					amount: formData.amount,
					type: formData.type,
					description: formData.description,
					category: formData.category,
					paymentMethod: formData.paymentMethod,
					date: formData.date,
					userId: user.id
				}, {
					headers: { Authorization: `Bearer ${token}` },
				});
				fetchExpenses();
				// setExpenses([...expenses, response.data.expense]);
				toast.success("Expense added successfully!");
			}
			setShowModal(false);
			fetchExpenses();
		} catch (error) {
			toast.error("Failed to save expense");
		} finally {
			setExpenseLoading(false);
		}
	};

	const handleDelete = async (expense) => {
		setExpenseLoading(true);
		try{
			const token = localStorage.getItem("token");
			const response = await axios.delete(apiUrl + `/api/expenses/delete/${expense.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			if(response.data.success){
				fetchExpenses();
				toast.success('Expense deleted successfully')
			}else{
				toast.error('Something went wrong');
			}
		}catch(err){
				toast.error('Failed to delete this expense');
		}finally{
			setExpenseLoading(false);
		}
	}

	if(loading || expenseLoading) return (<Loading />);

	if(!loading && !user){
		return (<AuthPage />);
	}

	if(user.role === 'admin'){
		return (<AdminAnalytics />)
	}

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-900 text-white p-6 mt-18">
				<div className="bg-gray-800 p-6 rounded-lg shadow-md text-white mb-6 max-w-5xl mx-auto space-y-4">
					<h3 className="text-xl font-semibold text-gray-300 mb-4">💰 General Info</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="p-4 bg-green-700 rounded-lg shadow">
							<h4 className="text-lg font-medium">Cash In</h4>
							<p className="text-2xl font-bold">₹{cashIn.toFixed(2)}</p>
						</div>
						<div className="p-4 bg-red-700 rounded-lg shadow">
							<h4 className="text-lg font-medium">Cash Out</h4>
							<p className="text-2xl font-bold">₹{cashOut.toFixed(2)}</p>
						</div>
						<div className={`p-4 rounded-lg shadow ${netBalance >= 0 ? "bg-blue-700" : "bg-yellow-700"}`}>
							<h4 className="text-lg font-medium">Net Balance</h4>
							<p className="text-2xl font-bold">₹{netBalance.toFixed(2)}</p>
						</div>
					</div>
				</div>
				<div className="max-w-5xl mx-auto space-y-4">
					{/* Button to Show Filters on Mobile */}
					<button
						onClick={() => setShowFilters(!showFilters)}
						className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md md:hidden w-full mb-3"
					>
						{showFilters ? "Hide Filters" : "Filter Options"}
					</button>

					{/* Filter Section (Hidden on Mobile, Always Visible on Larger Screens) */}
					<div className={`bg-gray-800 p-4 rounded-lg shadow-md mb-4 ${showFilters ? "block" : "hidden"} md:block`}>
						<h3 className="text-lg font-semibold text-gray-300 mb-2">Filters</h3>
						
						<div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
							{/* Date From */}
							<div className="flex flex-col">
								<label htmlFor="dateFrom" className="text-gray-300 text-sm mb-1">
									Date From:
								</label>
								<input
									id="dateFrom"
									type="date"
									name="dateFrom"
									value={filterData.dateFrom}
									onChange={(e) => setFilterData({ ...filterData, dateFrom: e.target.value })}
									className="p-2 rounded bg-gray-700 text-white"
								/>
							</div>

							{/* Date To */}
							<div className="flex flex-col">
								<label htmlFor="dateTo" className="text-gray-300 text-sm mb-1">
									Date To:
								</label>
								<input
									type="date"
									name="dateTo"
									value={filterData.dateTo}
									onChange={(e) => setFilterData({ ...filterData, dateTo: e.target.value })}
									className="p-2 rounded bg-gray-700 text-white"
								/>
							</div>

							{/* Type Filter */}
							<div className="flex flex-col">
								<label htmlFor="type" className="text-gray-300 text-sm mb-1">
									Type:
								</label>
								<select
									name="type"
									value={filterData.type}
									onChange={(e) => setFilterData({ ...filterData, type: e.target.value })}
									className="p-2 rounded bg-gray-700 text-white"
								>
									<option value="">All Types</option>
									<option value="expense">Expense</option>
									<option value="income">Income</option>
								</select>
							</div>

							{/* Category Filter */}
							<div className="flex flex-col">
								<label htmlFor="category" className="text-gray-300 text-sm mb-1">
									Category:
								</label>
								<input
									type="text"
									name="category"
									placeholder="Category"
									value={filterData.category}
									onChange={(e) => setFilterData({ ...filterData, category: e.target.value })}
									className="p-2 rounded bg-gray-700 text-white"
								/>
							</div>

							{/* Payment Method Filter */}
							<div className="flex flex-col">
								<label htmlFor="paymentMethod" className="text-gray-300 text-sm mb-1">
									Payment Method:
								</label>
								<select
									name="paymentMethod"
									value={filterData.paymentMethod}
									onChange={(e) => setFilterData({ ...filterData, paymentMethod: e.target.value })}
									className="p-2 rounded bg-gray-700 text-white"
								>
									<option value="">All Methods</option>
									<option value="online">Online</option>
									<option value="cash">Cash</option>
								</select>
							</div>
						</div>

						{/* Buttons - Apply & Reset */}
						<div className="flex gap-4 mt-3">
							<button
								onClick={() => {
									applyFilter();
									setShowFilters(false); // Hide filter section after applying
								}}
								className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
							>
								Apply Filters
							</button>
							
							<button
								onClick={() => {
									setFilterData({ dateFrom: "", dateTo: "", type: "", category: "", paymentMethod: "" });
									applyFilter();
									setShowFilters(false);
								}}
								className="flex-1 bg-gray-600 hover:bg-gray-700 p-2 rounded text-white"
							>
								Reset Filters
							</button>
						</div>
					</div>

					<h2 className="text-2xl font-semibold text-gray-300 mb-4">My Expenses</h2>

					{/* Expense Table */}
					<div className="overflow-x-auto">
					<table className="min-w-full bg-gray-800 shadow-md rounded-lg">
						<thead>
							<tr className="bg-gray-700 text-gray-300">
								<th className="px-4 py-2 text-left">Date</th>
								<th className="px-4 py-2 text-left">Description</th>
								<th className="px-4 py-2 text-left">Category</th>
								<th className="px-4 py-2 text-left">Payment Method</th>
								<th className="px-4 py-2 text-left">Type</th>
								<th className="px-4 py-2 text-left">Amount (Rs)</th>
								<th className="px-4 py-2 text-center sticky right-0 bg-gray-700">Actions</th>
							</tr>
						</thead>
						<tbody>
						{filterExpenses.length > 0 ? (
							filterExpenses.map((expense) => (
								<tr key={expense.id} className="border-b border-gray-700 hover:bg-gray-750 group">
									{/* Date Column */}
									<td className="px-4 py-2">{new Date(expense.date).toLocaleDateString()}</td>

									{/* Description Column */}
									<td className="px-4 py-2">{expense.description || "--"}</td>

									{/* Category Column */}
									<td className="px-4 py-2 capitalize">{expense.category}</td>

									{/* Payment Method Column */}
									<td className="px-4 py-2">
										<span
											className={`px-3 py-1 rounded-full text-white ${
												expense.paymentMethod === "online" ? "bg-blue-600" : "bg-gray-600"
											}`}
										>
											{expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1)}
										</span>
									</td>

									{/* Type Column */}
									<td className="px-4 py-2">
										<span
											className={`px-3 py-1 rounded-full text-white ${
												expense.type === "expense" ? "bg-red-600" : "bg-green-600"
											}`}
										>
											{expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}
										</span>
									</td>

									{/* Amount Column */}
									<td className="px-4 py-2 capitalize">{expense.amount}</td>

									{/* Actions Column - Now works on full row hover */}
									<td className="px-4 py-2 text-center sticky right-0 bg-gray-800">
										<div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
											<button
												className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition"
												onClick={() => openModal(expense)}
											>
												<FiEdit3 />
											</button>
											<button
												className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
												onClick={() => handleDelete(expense)}
											>
												<MdDeleteOutline />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="7" className="text-center text-gray-400 py-4">No expenses found.</td>
							</tr>
						)}
					</tbody>

					</table>

					</div>
				</div>

				{/* Floating Add Expense Button */}
				<button
					onClick={() => openModal()}
					className="group fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg inline-flex items-center justify-center text-lg transition-all duration-300 ease-in-out w-auto group-hover:rounded-lg group-hover:px-6"
				>
					<span className="text-xl transition-all duration-300 ease-in-out group-hover:opacity-0">+</span>
					<span className="hidden group-hover:inline-block transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 ml-3">+ Add Expense</span>
				</button>


				{/* <button onClick={() => openModal()} className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center text-lg">
					➕
				</button> */}

				{/* Modal */}
				{showModal && (
					<div className="fixed inset-0 flex items-center justify-center  bg-opacity-30 backdrop-blur-xs" onClick={closeModal}>
						<div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative" onClick={(e) => e.stopPropagation()}>
							<button onClick={closeModal} className="absolute top-3 right-4 text-gray-400 hover:text-gray-200 transition">✖</button>
							<h3 className="text-lg font-bold mb-3">{editingExpense ? "Edit Expense" : "Add New Expense"}</h3>
							<form onSubmit={handleSaveExpense} className="space-y-4">
								{/* Amount Input */}
								<input
									type="number"
									name="amount"
									value={formData.amount}
									onChange={handleChange}
									placeholder="Amount"
									className="w-full p-2 rounded bg-gray-700 text-white"
									required
								/>

								{/* Category Input */}
								<input
									type="text"
									name="category"
									value={formData.category}
									onChange={handleChange}
									placeholder="Category"
									className="w-full p-2 rounded bg-gray-700 text-white"
									required
								/>

								{/* Description Textarea */}
								<textarea
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Description"
									className="w-full p-2 rounded bg-gray-700 text-white"
									rows="4"
								></textarea>

								{/* Type Dropdown */}
								<select
									name="type"
									value={formData.type}
									onChange={handleChange}
									className="w-full p-2 rounded bg-gray-700 text-white"
									required
								>
									<option value="expense">Expense</option>
									<option value="income">Income</option>
								</select>

								{/* Payment Method Dropdown */}
								<select
									name="paymentMethod"
									value={formData.paymentMethod}
									onChange={handleChange}
									className="w-full p-2 rounded bg-gray-700 text-white"
									required
								>
									<option value="online">Online</option>
									<option value="cash">Cash</option>
								</select>

								{/* Date Input */}
								<input
									type="date"
									name="date"
									value={formData.date}
									onChange={handleChange}
									className="w-full p-2 rounded bg-gray-700 text-white"
									required
								/>

								{/* Submit Button */}
								<button
									type="submit"
									className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
								>
									{editingExpense ? "Update Expense" : "Add Expense"}
								</button>
							</form>

						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default UserDashboard;