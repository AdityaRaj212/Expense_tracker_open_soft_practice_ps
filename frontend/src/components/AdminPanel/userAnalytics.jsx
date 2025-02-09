import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../pages/Loading";
import AdminNavbar from "../AdminNavbar";
import AuthPage from "../../pages/AuthPage";

const UserAnalytics = () => {
  const { apiUrl, loading, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    setDataLoading(true);
    fetch(apiUrl + "/api/admin/users/all-expenses") //tried axios but was getting error
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(()=>{
        setDataLoading(false);
      });
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    console.log('selected user: ', user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  if(loading || dataLoading) return (<Loading />);

  if(!loading && !user){
		return (<AuthPage />);
	}

  return (
    <div className="min-h-screen bg-gray-900 ">
      <AdminNavbar />
      <div className="p-6 z-50 mt-18 flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-4 text-white">User Analytics</h2>
        <table className="w-full border-collapse mb-5 text-sm rounded-xl overflow-hidden ">
          <thead className="bg-gray-500 text-lg font-bold">
            <tr  >
              <th className="p-3 text-left border-b border-[#2a3a4f]  text-gray-200 ">User ID</th>
              <th className="p-3 text-left border-b border-[#2a3a4f]  text-gray-200 ">Name</th>
              <th className="p-3 text-left border-b border-[#2a3a4f]  text-gray-200 ">Last Transaction</th>
              <th className="p-3 text-left border-b border-[#2a3a4f]  text-gray-200 ">Last Transaction Amount</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 font-semibold">
            {users.map((user) => {
              const lastTransaction = user.expenses.length > 0 ? user.expenses[0] : null;
              return (
                <tr
                  key={user.userId}
                  className="cursor-pointer hover:bg-gray-700 text-gray-300"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="p-3 border-b border-[#2a3a4f]">{user.userId}</td>
                  <td className="p-3 border-b border-[#2a3a4f]">{user.name}</td>
                  <td className="p-3 border-b border-[#2a3a4f]">
                    {lastTransaction ? lastTransaction.date : "No recent transaction"}
                  </td>
                  <td className="p-3 border-b border-[#2a3a4f] ">
                    {/* <span className="bg-green-600 font-semibold rounded-full flex justify-center w-[10%]">₹{lastTransaction ? lastTransaction.amount : "N/A"}</span> */}
                    <span className={`font-semibold rounded-full flex items-center justify-center w-[10%] px-3 py-1 
                      ${lastTransaction?.amount ? "bg-green-600 text-white" : "bg-gray-400 text-gray-900 italic"}`}>
                      {lastTransaction?.amount 
                        ? `₹${lastTransaction.amount}` 
                        : "N/A"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-11/12 md:w-4/5 max-w-3xl text-gray-200 relative">
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition duration-300 
                          hover:bg-gray-700 p-2 rounded-full"
                onClick={closeModal}
              >
                ❌
              </button>

              <h3 className="text-2xl font-bold mb-5 text-center">User Details</h3>
              <div className="mb-4">
                <p><strong>User ID:</strong> {selectedUser.userId}</p>
                <p><strong>Name:</strong> {selectedUser.name}</p>
              </div>

              <h4 className="text-xl font-semibold mt-6 mb-3">Transactions</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                  <thead className="bg-gray-700 text-gray-100">
                    <tr>
                      {["Amount", "Description", "Category", "Type", "Payment Method"].map((header) => (
                        <th key={header} className="p-3 text-left border-b border-gray-600 font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {selectedUser.expenses.length > 0 ? (
                      selectedUser.expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-700 transition duration-300">
                          <td className="p-3">
                            <span className="bg-green-600 text-white font-semibold px-3 py-1 rounded-full">
                              ₹{expense.amount}
                            </span>
                          </td>
                          <td className="p-3">{expense.description==='' ? 'No Description' : expense.description}</td>
                          <td className="p-3">{expense.category}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-sm text-white ${
                              expense.type === "income" ? "bg-green-700" : "bg-red-600"
                            }`}>
                              {expense.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm text-white">
                              {expense.paymentMethod}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-400">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>


  );
};

export default UserAnalytics;
