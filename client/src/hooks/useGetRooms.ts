import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { Chat } from "@/types";

export function useGetRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data } = await api.get<Chat[]>("/rooms");

      return data;
    },
  });
}
