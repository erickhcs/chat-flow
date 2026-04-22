export type Chat = {
  id: number;
  name: string;
};

export type Message = {
  id: number;
  content: string;
  userId: number;
  roomId: number;
  createdAt: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
};
