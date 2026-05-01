import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "@/types";

type PostSignUpPayload = {
  email: string;
  password: string;
  name: string;
};

export type PostSignUpResponse = {
  token: string;
  user: User;
};

const usePostSignUp = () => {
  return useMutation({
    mutationFn: async ({ email, password, name }: PostSignUpPayload) => {
      const { data } = await api.post<PostSignUpResponse>("/users/signup", {
        email,
        password,
        name,
      });

      return data;
    },
  });
};

export default usePostSignUp;
