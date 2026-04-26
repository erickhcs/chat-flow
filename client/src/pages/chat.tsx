import { ChatList } from "@/components/chatList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useFetch from "@/hooks/useFetch";
import type { Chat } from "@/types";
import { useEffect, useState } from "react";

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat>();
  const { fetchApiWithAuth } = useFetch();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetchApiWithAuth(
          `${import.meta.env.VITE_API_URL}/rooms`,
        );
        if (!response) return;
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats: ", error);
      }
    };

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-dvh w-full min-h-0 overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <aside className="chat-scroll h-full w-1/4 overflow-x-hidden overflow-y-auto p-4">
        <h2>Chats</h2>
        <div className="flex gap-1 flex-col">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="flex flex-col sm:flex-row items-center gap-2 cursor-pointer hover:bg-gray-600 p-2 rounded-sm"
            >
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                  className="grayscale"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <p className="wrap-anywhere">{chat.name}</p>
            </div>
          ))}
        </div>
      </aside>
      <hr className="h-full w-px bg-white" />
      <div className="h-full w-3/4 min-h-0 p-4">
        {selectedChat ? (
          <ChatList selectedChat={selectedChat} />
        ) : (
          <h2>Chat Window</h2>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
