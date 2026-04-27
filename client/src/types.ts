type ChatUser = User & {
  role: "ADMIN" | "MEMBER";
};

export type Chat = {
  id: number;
  name: string;
  type: "PRIVATE" | "GROUP";
  users: ChatUser[];
  imageUrl?: string;
};

export type Message = {
  id: number;
  content: string;
  userId: number;
  roomId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
};

export type User = {
  id: number;
  name: string;
  email: string;
};
