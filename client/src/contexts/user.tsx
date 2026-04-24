import type { User } from "@/types";
import { createContext, useState, type ReactNode } from "react";

type UserContextProps = {
  user?: User | null;
  setUser: (user: User | null) => void;
  token?: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

const UserContext = createContext<UserContextProps | null>(null);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(token));

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
