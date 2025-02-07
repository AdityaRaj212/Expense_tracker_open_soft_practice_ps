import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";

const UserAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/users/all-expenses") //tried axios but was getting error
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 ">
      <Navbar />
      <div className="p-6 z-50 mt-24 flex flex-col items-center">
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
                    {lastTransaction ? lastTransaction.date : "N/A"}
                  </td>
                  <td className="p-3 border-b border-[#2a3a4f] ">
                    <span className="bg-green-600 font-semibold rounded-full flex justify-center w-[10%]">₹{lastTransaction ? lastTransaction.amount : "N/A"}</span>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {selectedUser && (
          <div className="fixed inset-0 mt-16 bg-black/80 bg-opacity-75 flex justify-center items-center">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-1/2 md:w-4/5 text-gray-200">
              <h3 className="text-xl font-bold mb-5">User Details</h3>
              <p className="mb-2">
                <strong>User ID:</strong> {selectedUser.userId}
              </p>
              <p className="mb-4">
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <h4 className="text-lg font-semibold mt-4 mb-2">Transactions:</h4>
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead className="bg-gray-500 text-lg">
                  <tr>
                    <th className="p-2 text-left border-b border-[#2a3a4f] font-semibold">Amount</th>
                    <th className="p-2 text-left border-b border-[#2a3a4f] font-semibold">Description</th>
                    <th className="p-2 text-left border-b border-[#2a3a4f] font-semibold">Category</th>
                    <th className="p-2 text-left border-b border-[#2a3a4f] font-semibold">Type</th>
                    <th className="p-2 text-left border-b border-[#2a3a4f] font-semibold">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800">
                  {selectedUser.expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-[#2a3a4f] hover:bg-gray-700">
                      <td className="p-2"><span className="bg-green-600 font-semibold rounded-full flex justify-center w-[50%]">₹{expense.amount}</span>
                      </td>
                      <td className="p-2">{expense.description}</td>
                      <td className="p-2">{expense.category}</td>
                      <td className="p-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${expense.type === 'income' ? 'bg-green-700' : 'bg-red-600'
                          }`}>
                          {expense.type}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                          {expense.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>


  );
};

export default UserAnalytics;
