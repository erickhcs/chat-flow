import { useNavigate } from "react-router-dom";

const useFetch = () => {
  const navigate = useNavigate();

  const fetchApi = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);

    return response;
  };

  const fetchApiWithAuth = async (url: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return null;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return null;
    }

    return res;
  };

  return { fetchApiWithAuth, fetchApi };
};

export default useFetch;
