import useUserContext from "@/contexts/hooks/user";
import { useNavigate } from "react-router-dom";

const useFetch = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setIsAuthenticated } = useUserContext();

  const fetchApi = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);

    return response;
  };

  const fetchApiWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return null;
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      navigate("/login");
      return null;
    }

    return res;
  };

  return { fetchApiWithAuth, fetchApi };
};

export default useFetch;
