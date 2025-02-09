import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const AuthPage = () => {
  const { apiUrl, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", role: "user", otp: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", name: "", role: "user", otp: "" });
    setOtpSent(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/api/auth/send-otp`, { email: formData.email });
      if (response.data.success) {
        toast.success("OTP sent to super admin");
        setOtpSent(true);
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !formData.name) {
      toast.error("Name is required for signup");
      setLoading(false);
      return;
    }

    if (!isLogin && formData.role === "admin" && !formData.otp) {
      toast.error("OTP is required for admin registration");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result) navigate("/");
      } else {
        const result = await signup(formData.name, formData.email, formData.password, formData.role, formData.otp);
        if (result) setIsLogin(true);
        else toast.error("Something went wrong! Please try again");
      }
    } catch (err) {
      console.log('error: ', err);
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 text-white">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login to Expense Tracker" : "Sign Up for Expense Tracker"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-blue-500"
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-blue-500"
            required
          />

          {formData.role === "admin" && (
            <>
              {!otpSent && (
                <button type="button" onClick={handleSendOtp} className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded">
                  Send OTP
                </button>
              )}
              {otpSent && (
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-blue-500"
                  required
                />
              )}
            </>
          )}

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={toggleMode}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;