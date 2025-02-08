import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loading from "../pages/Loading";

const AdminNavbar = () => {
  const { loading, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) return <Loading />;

  return (
    <nav className="fixed top-0 left-0 w-full h-18 bg-gray-900 bg-opacity-80 backdrop-blur-md text-white shadow-lg p-4 flex justify-between items-center z-50">
      {/* Logo */}
      <div className="text-2xl font-bold text-green-400">
        Admin Dashboard
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6">
        <a href="/admin/platform-analytics" className="hover:text-green-400 transition duration-200">
          Dashboard
        </a>
        <a href="/admin/user-analytics" className="hover:text-green-400 transition duration-200">
          User Analytics
        </a>
        <a href="/admin/reports" className="hover:text-green-400 transition duration-200">
          Reports
        </a>
        <a href="/admin/settings" className="hover:text-green-400 transition duration-200">
          Settings
        </a>
      </div>

      {/* Profile Section */}
      <div className="relative">
        <div
          className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full cursor-pointer text-lg font-semibold hover:bg-green-600 transition duration-200"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 shadow-lg rounded-md overflow-hidden">
            <div className="p-3 text-gray-200 border-b border-gray-600">
              {user?.name}
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
