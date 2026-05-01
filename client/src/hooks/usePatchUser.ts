import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "@/types";

type EditUserPayload = {
  name: string;
  imageUrl?: string;
};

const usePatchUser = () => {
  return useMutation({
    mutationFn: async ({ name, imageUrl }: EditUserPayload) => {
      const { data } = await api.patch<User>("/rooms", {
        name,
        imageUrl,
      });

      return data;
    },
  });
};

export default usePatchUser;
