import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (adminData) => {
    localStorage.setItem("admin", JSON.stringify(adminData));
    setAdmin(adminData);
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("admin");
    setAdmin(null);
    navigate("/");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
