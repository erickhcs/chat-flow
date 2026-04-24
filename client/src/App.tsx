import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "@/pages/chat";
import LoginPage from "@/pages/login";
import useUserContext from "./contexts/hooks/user";
import "./App.css";

function App() {
  const { isAuthenticated } = useUserContext();

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
        element={isAuthenticated ? <Navigate to="/chats" /> : <LoginPage />}
      />
      <Route
        path="/chats"
        element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
