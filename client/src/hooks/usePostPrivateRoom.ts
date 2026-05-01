import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { Chat } from "@/types";

type PostPrivateRoomPayload = {
  userId: number;
};

const usePostPrivateRoom = () => {
  return useMutation({
    mutationFn: async ({ userId }: PostPrivateRoomPayload) => {
      const { data } = await api.post<Chat>(`/rooms/private/${userId}`);

      return data;
    },
  });
};

export default usePostPrivateRoom;
