type ChatUser = User & {
  role: "ADMIN" | "MEMBER";
};

export type Chat = {
  id: number;
  name: string;
  type: "PRIVATE" | "GROUP";
  users: ChatUser[];
  imageUrl?: string;
  lastMessageAt?: Date;
  lastMessageContent?: string;
  lastMessageUserName?: string;
  lastMessageUserId?: number;
};

export type Message = {
  id: number;
  content: string;
  userId: number;
  roomId: number;
  createdAt: string;
  user: User;
};

export type User = {
  id: number;
  name: string;
  email: string;
  imageUrl?: string;
};
