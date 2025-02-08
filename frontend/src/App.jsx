import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import UserDashboard from "./pages/Dashboard2";
import UserAnalytics from "./components/AdminPanel/userAnalytics";
import AdminAnalytics from "./pages/AdminAnalytics";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin/user-analytics" element={<UserAnalytics />} />
          <Route path="/admin/platform-analytics" element={<AdminAnalytics />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
