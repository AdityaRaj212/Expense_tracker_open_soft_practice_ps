import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-24 bg-gray-800 text-white shadow-lg p-4 z-40">
    {/* <nav className="bg-gray-800 text-white shadow-lg"> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-green-400">
              ExpenseTracker
            </a>
          </div>

          {/* Links for larger screens */}
          <div className="hidden md:flex space-x-8">
            <a
              href="/dashboard"
              className="hover:text-green-400 transition duration-200"
            >
              Dashboard
            </a>
            <a
              href="/transactions"
              className="hover:text-green-400 transition duration-200"
            >
              Transactions
            </a>
            <a
              href="/profile"
              className="hover:text-green-400 transition duration-200"
            >
              Profile
            </a>
            <a
              href="/settings"
              className="hover:text-green-400 transition duration-200"
            >
              Settings
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white focus:outline-none"
              onClick={() => {
                const menu = document.getElementById("mobile-menu");
                menu.classList.toggle("hidden");
              }}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden md:hidden bg-gray-700">
        <a
          href="/dashboard"
          className="block px-4 py-2 text-white hover:bg-gray-600"
        >
          Dashboard
        </a>
        <a
          href="/transactions"
          className="block px-4 py-2 text-white hover:bg-gray-600"
        >
          Transactions
        </a>
        <a
          href="/profile"
          className="block px-4 py-2 text-white hover:bg-gray-600"
        >
          Profile
        </a>
        <a
          href="/settings"
          className="block px-4 py-2 text-white hover:bg-gray-600"
        >
          Settings
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
