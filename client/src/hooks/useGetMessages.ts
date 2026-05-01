import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { Message } from "@/types";

const useGetMessages = (roomId: number) => {
  return useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const { data } = await api.get<Message[]>(`/messages/${roomId}`);

      return data;
    },

    enabled: !!roomId,
  });
};

export default useGetMessages;
