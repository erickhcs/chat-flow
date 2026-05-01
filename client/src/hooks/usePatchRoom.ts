import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { Chat } from "@/types";

type EditRoomPayload = {
  roomId: number;
  name: string;
  imageUrl?: string | null;
};

const usePatchRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId, name, imageUrl }: EditRoomPayload) => {
      const { data } = await api.patch<Chat>(`/rooms/${roomId}`, {
        name,
        imageUrl,
      });

      return data;
    },
  });
};

export default usePatchRoom;
