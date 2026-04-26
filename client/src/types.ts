export type Chat = {
  id: number;
  name: string;
  type: "PRIVATE" | "GROUP";
  users: User[];
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
