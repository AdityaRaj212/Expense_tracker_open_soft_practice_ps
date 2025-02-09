import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loading from "../pages/Loading";

const Navbar = () => {
  const { loading, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (loading) return <Loading />;

  console.log("user: ", user);

  return (
    <nav className="fixed top-0 left-0 w-full h-18 bg-gray-800 text-white shadow-lg p-4 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-green-400">
              ExpenseTracker
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 text-gray-300">
            <a href="/" className="hover:text-green-400 transition">
              Dashboard
            </a>
            <a href="/transactions" className="hover:text-green-400 transition">
              Transactions
            </a>
            <a href="/profile" className="hover:text-green-400 transition">
              Profile
            </a>
            <a href="/settings" className="hover:text-green-400 transition">
              Settings
            </a>
          </div>

          {/* Profile Section */}
          <div className="relative">
            <div
              className="w-10 h-10 bg-green-500 text-white flex justify-center items-center rounded-full cursor-pointer text-lg font-semibold hover:opacity-90 transition"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 shadow-lg rounded-md overflow-hidden border border-gray-700">
                <div className="px-4 py-2 text-white border-b border-gray-700">
                  {user?.name}
                </div>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-red-500 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
      {menuOpen && (
        <div className="md:hidden bg-gray-800">
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
      )}
    </nav>
  );
};

export default Navbar;


// import React from "react";
// import { useAuth } from "../context/AuthContext";
// import Loading from "../pages/Loading";

// const Navbar = () => {
//   const { loading, user } = useAuth();

//   if(loading) return(<Loading />);

//   console.log('user: ', user);
//   return (
//     <nav className="fixed top-0 left-0 w-full h-24 bg-gray-800 text-white shadow-lg p-4 z-40">
//     {/* <nav className="bg-gray-800 text-white shadow-lg"> */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <a href="/" className="text-2xl font-bold text-green-400">
//               ExpenseTracker
//             </a>
//           </div>

//           {/* Links for larger screens */}
//           <div className="hidden md:flex space-x-8">
//             <a
//               href="/dashboard"
//               className="hover:text-green-400 transition duration-200"
//             >
//               Dashboard
//             </a>
//             <a
//               href="/transactions"
//               className="hover:text-green-400 transition duration-200"
//             >
//               Transactions
//             </a>
//             <a
//               href="/profile"
//               className="hover:text-green-400 transition duration-200"
//             >
//               Profile
//             </a>
//             <a
//               href="/settings"
//               className="hover:text-green-400 transition duration-200"
//             >
//               Settings
//             </a>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <button
//               type="button"
//               className="text-gray-300 hover:text-white focus:outline-none"
//               onClick={() => {
//                 const menu = document.getElementById("mobile-menu");
//                 menu.classList.toggle("hidden");
//               }}
//             >
//               <svg
//                 className="h-6 w-6"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 aria-hidden="true"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M4 6h16M4 12h16m-7 6h7"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div id="mobile-menu" className="hidden md:hidden bg-gray-700">
//         <a
//           href="/dashboard"
//           className="block px-4 py-2 text-white hover:bg-gray-600"
//         >
//           Dashboard
//         </a>
//         <a
//           href="/transactions"
//           className="block px-4 py-2 text-white hover:bg-gray-600"
//         >
//           Transactions
//         </a>
//         <a
//           href="/profile"
//           className="block px-4 py-2 text-white hover:bg-gray-600"
//         >
//           Profile
//         </a>
//         <a
//           href="/settings"
//           className="block px-4 py-2 text-white hover:bg-gray-600"
//         >
//           Settings
//         </a>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
