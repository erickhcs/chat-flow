import { CustomAvatar } from "@/components/customAvatar";
import { EditChatAction } from "./editChatAction";
import type { Chat } from "@/types";

type ChatHeaderProps = {
  selectedChat: Chat;
  onEditChat: (chat: Chat) => void;
};

const ChatHeader = ({ selectedChat, onEditChat }: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b-2 bg-gray-900">
      <div className="flex justify-start items-center gap-3">
        <CustomAvatar
          name={selectedChat.name}
          imageUrl={selectedChat.imageUrl}
        />
        <p>{selectedChat.name}</p>
      </div>
      <div>
        <EditChatAction selectedChat={selectedChat} onEditChat={onEditChat} />
      </div>
    </div>
  );
};

export default ChatHeader;
