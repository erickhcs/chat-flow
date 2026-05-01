import { ChatList } from "@/components/chatList";
import type { Chat } from "@/types";
import { useState } from "react";

import { ActionsHeader } from "@/components/actionsHeader";
import clsx from "clsx";
import { Spinner } from "@/components/ui/spinner";
import CustomAvatar from "@/components/customAvatar/customAvatar";
import { useGetRooms } from "@/hooks/useGetRooms";
import { useQueryClient } from "@tanstack/react-query";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<Chat>();
  const { data: chats, isLoading: isLoadingChats } = useGetRooms();
  const queryClient = useQueryClient();

  const handleLeaveChat = () => {
    setSelectedChat(undefined);
  };

  const handleEditChat = (editedChat: Chat) => {
    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return oldRooms;

      return oldRooms.map((chat) =>
        chat.id === editedChat.id ? editedChat : chat,
      );
    });

    setSelectedChat(editedChat);
  };

  const handleAddChat = (newChat: Chat) => {
    setSelectedChat(newChat);
    console.log("TESTING NEW CHAT: ", newChat);

    if (chats?.some((chat) => chat.id === newChat.id)) return;

    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return [newChat];

      return [...oldRooms, newChat];
    });
  };

  return (
    <>
      <div className="flex flex-col overflow-y-auto">
        <ActionsHeader onAddChat={handleAddChat} />
        <div className="flex h-svh w-full min-h-0 overflow-hidden">
          <aside className="chat-scroll h-full w-1/4 overflow-x-hidden overflow-y-auto p-4 border-r-2">
            <h2>Chats</h2>
            <div className="flex gap-1 flex-col">
              {isLoadingChats ? (
                <div className="flex justify-center mt-2">
                  <Spinner data-icon="inline-start" className="ml-2" />
                </div>
              ) : (
                chats?.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={clsx(
                      "flex flex-col sm:flex-row items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded-sm",
                      selectedChat?.id === chat.id && "bg-gray-600",
                    )}
                  >
                    <CustomAvatar name={chat.name} imageUrl={chat.imageUrl} />

                    <p className="wrap-anywhere text-start">{chat.name}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
          <div className="h-full w-3/4 min-h-0 pb-4">
            {selectedChat ? (
              <ChatList
                onLeaveChat={handleLeaveChat}
                onEditChat={handleEditChat}
                selectedChat={selectedChat}
              />
            ) : (
              <h2 className="pt-4">Chat Window</h2>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
