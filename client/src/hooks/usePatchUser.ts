import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "@/types";

type EditUserPayload = {
  name: string;
  userId: number;
  imageUrl?: string;
};

const usePatchUser = () => {
  return useMutation({
    mutationFn: async ({ name, imageUrl, userId }: EditUserPayload) => {
      const { data } = await api.patch<User>(`/users/${userId}`, {
        name,
        imageUrl,
      });

      return data;
    },
  });
};

export default usePatchUser;
