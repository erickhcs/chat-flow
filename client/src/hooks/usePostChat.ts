import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { Chat } from "@/types";

type CreateChatPayload = {
  name: string;
  imageUrl?: string;
};

const usePostChat = () => {
  return useMutation({
    mutationFn: async ({ name, imageUrl }: CreateChatPayload) => {
      const { data } = await api.post<Chat>("/rooms", {
        name,
        imageUrl,
      });

      return data;
    },
  });
};

export default usePostChat;
