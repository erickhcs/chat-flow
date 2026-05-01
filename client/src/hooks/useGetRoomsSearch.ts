import type { Chat, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type SearchResult = {
  users: User[];
  groups: Chat[];
};

const useGetRoomsSearch = (searchQuery: string) => {
  return useQuery<SearchResult>({
    queryKey: ["roomsSearch", searchQuery],
    queryFn: async () => {
      const { data } = await api.get<SearchResult>("/rooms/search", {
        params: {
          searchQuery,
        },
      });

      return data;
    },
    enabled: !!searchQuery.trim(),
  });
};

export default useGetRoomsSearch;
