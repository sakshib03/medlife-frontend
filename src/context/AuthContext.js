import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();
const token = Cookies.get("accessToken");
export const AuthProvider = ({ children }) => {
  // null = still checking cookies, true/false = known status
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    
    setIsAuthenticated(!!token);
  }, []);

  const login = (email, token) => {
    Cookies.set("accessToken", token, {
      expires: 7, // 7 days
      secure: true,
      sameSite: "Strict"
    });
    Cookies.set("userEmail", email, {
      expires: 7,
      secure: true,
      sameSite: "Strict"
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("userEmail");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
