import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { Chat } from "@/types";

type PostJoinRoomPayload = {
  roomId: number;
};

const usePostJoinRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId }: PostJoinRoomPayload) => {
      const { data } = await api.post<Chat>(`/rooms/${roomId}/join`);

      return data;
    },
  });
};

export default usePostJoinRoom;
