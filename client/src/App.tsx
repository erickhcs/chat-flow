import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import ChatPage from "@/pages/chat";
import LoginPage from "@/pages/login";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/chats" /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/chats" />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route
        path="/chats"
        element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
