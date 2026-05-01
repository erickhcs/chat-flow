import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

type PostLeaveRoomPayload = {
  roomId: number;
};

const usePostLeaveRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId }: PostLeaveRoomPayload) => {
      const { data } = await api.post(`/rooms/${roomId}/leave`);

      return data;
    },
  });
};

export default usePostLeaveRoom;
