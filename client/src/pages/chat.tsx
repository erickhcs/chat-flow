import { ChatList } from "@/components/chatList";
import type { Chat, Message } from "@/types";
import { useCallback, useEffect, useState } from "react";

import { ActionsHeader } from "@/components/actionsHeader";
import clsx from "clsx";
import { Spinner } from "@/components/ui/spinner";
import CustomAvatar from "@/components/customAvatar/customAvatar";
import { useGetRooms } from "@/hooks/useGetRooms";
import { useQueryClient } from "@tanstack/react-query";
import { webSocketClient } from "@/websocket";
import useUserContext from "@/contexts/hooks/user";

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState<number>();
  const { data: chats, isLoading: isLoadingChats } = useGetRooms();
  const queryClient = useQueryClient();
  const rooms = queryClient.getQueryData(["rooms"]) as Chat[] | undefined;
  const handleLeaveChat = () => {
    setSelectedChatId(undefined);
  };
  const { user } = useUserContext();

  const handleEditChat = (editedChat: Chat) => {
    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return oldRooms;

      return oldRooms.map((chat) =>
        chat.id === editedChat.id ? editedChat : chat,
      );
    });

    setSelectedChatId(editedChat.id);
  };

  const handleAddChat = (newChat: Chat) => {
    setSelectedChatId(newChat.id);

    if (chats?.some((chat) => chat.id === newChat.id)) return;

    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return [newChat];

      return [...oldRooms, newChat];
    });
  };

  const handleReceiveMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData(
        ["messages", message.roomId],
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return [message];

          return [...oldMessages, message];
        },
      );

      queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
        if (!oldRooms) return oldRooms;
        const updated = oldRooms.map((room) =>
          room.id === message.roomId
            ? {
                ...room,
                lastMessageContent: message.content,
                lastMessageAt: message.createdAt,
                lastMessageUserName: message.user.name,
                lastMessageUserId: message.userId,
              }
            : room,
        );

        return updated.sort((a, b) => {
          const timeA =
            a.lastMessageAt instanceof Date
              ? a.lastMessageAt.getTime()
              : new Date(a.lastMessageAt || 0).getTime();
          const timeB =
            b.lastMessageAt instanceof Date
              ? b.lastMessageAt.getTime()
              : new Date(b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });
      });
    },
    [queryClient],
  );

  useEffect(() => {
    webSocketClient.connect(handleReceiveMessage);

    rooms?.map((room) => {
      webSocketClient.joinRoom(room.id);
    });

    return () => {
      rooms?.map((room) => {
        webSocketClient.leaveRoom(room.id);
      });
      webSocketClient.disconnect();
    };
  }, [handleReceiveMessage, rooms, selectedChatId]);

  return (
    <>
      <div className="flex flex-col overflow-y-auto">
        <ActionsHeader onAddChat={handleAddChat} />
        <div className="flex h-svh w-full min-h-0 overflow-hidden">
          <aside className="chat-scroll h-full w-1/4 overflow-x-hidden overflow-y-auto p-4 border-r-2">
            <div className="flex gap-1 flex-col">
              {isLoadingChats ? (
                <div className="flex justify-center mt-2">
                  <Spinner data-icon="inline-start" className="ml-2" />
                </div>
              ) : (
                chats?.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={clsx(
                      "flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:bg-gray-700 p-2 rounded-sm",
                      selectedChatId === chat.id && "bg-gray-600",
                    )}
                  >
                    <CustomAvatar name={chat.name} imageUrl={chat.imageUrl} />

                    <div>
                      <p className="wrap-anywhere text-start">{chat.name}</p>
                      <p className="wrap-anywhere text-start text-gray-500 text-sm">
                        {chat.lastMessageUserName && chat.type === "GROUP"
                          ? `${chat.lastMessageUserId === user?.id ? "You" : chat.lastMessageUserName.split(" ")[0]}: `
                          : ""}
                        {chat.lastMessageContent}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
          <div className="h-full w-3/4 min-h-0 pb-4">
            {selectedChatId ? (
              <ChatList
                onLeaveChat={handleLeaveChat}
                onEditChat={handleEditChat}
                selectedChatId={selectedChatId}
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
