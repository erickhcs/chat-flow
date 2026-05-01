import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "@/types";

type PostLoginPayload = {
  email: string;
  password: string;
};

export type PostLoginResponse = {
  token: string;
  user: User;
};

const usePostLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }: PostLoginPayload) => {
      const { data } = await api.post<PostLoginResponse>("/users/login", {
        email,
        password,
      });

      return data;
    },
  });
};

export default usePostLogin;
