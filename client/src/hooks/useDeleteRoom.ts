import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

type DeleteRoomPayload = {
  roomId: number;
};

const useDeleteRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId }: DeleteRoomPayload) => {
      const { data } = await api.delete(`/rooms/${roomId}`);

      return data;
    },
  });
};

export default useDeleteRoom;
