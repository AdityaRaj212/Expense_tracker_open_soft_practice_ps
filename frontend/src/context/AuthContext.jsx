import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user details if token exists
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const req = await axios.get(`${apiUrl}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('req: ', req);
                let obj = {...req.data, role: req.data.roleId===1 ? 'admin': 'user'};
                console.log('user: ', obj);
                setUser({...req.data, role: req.data.roleId===1 ? 'admin': 'user'});
            } catch {
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const signup = async (name, email, password, role, otp) => {
        try {
            const { data } = await axios.post(`${apiUrl}/api/auth/register`, { name, email, password, role, otp });
            console.log('Signup successful:', data);
            // After successful registration, log the user in automatically (optional)
            setUser(data.user);
            return true;
        } catch (error) {
            console.error("Signup failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    const googleLogin = async (data) => {
        try {
            localStorage.setItem("token", data.token);
            setUser(data.user);
            return true;
        } catch (error) {
            console.error("Google login failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    // Login function using basic auth format
    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${apiUrl}/api/auth/login`, {email, password});
            console.log('response data: ', data);
            localStorage.setItem("token", data.token);
            setUser({...data.user, role: data.user.roleId===1 ? 'admin': 'user'});
            return true;
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ apiUrl, user, login, signup, googleLogin, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);
