import { Skeleton } from "@/components/ui/skeleton";
import type { Chat, Message, User } from "@/types";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { webSocketClient } from "@/websocket";
import { ChatHeader } from "@/components/chatHeader";
import { CustomAvatar } from "../customAvatar";
import useGetMessages from "@/hooks/useGetMessages";
import { useQueryClient } from "@tanstack/react-query";

type ChatProps = {
  selectedChat: Chat;
  onLeaveChat: () => void;
  onEditChat: (chat: Chat) => void;
};

const USER_TEXT_COLOR_CLASSES = [
  "text-sky-300",
  "text-emerald-300",
  "text-amber-300",
  "text-rose-300",
  "text-violet-300",
  "text-cyan-300",
  "text-lime-300",
];

const getUserTextColorClass = (userId: number) => {
  const index = Math.abs(userId) % USER_TEXT_COLOR_CLASSES.length;

  return USER_TEXT_COLOR_CLASSES[index];
};

const ChatList = ({ selectedChat, onLeaveChat, onEditChat }: ChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const { data: messagesData, isLoading } = useGetMessages(selectedChat.id);
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");

  const handleReceiveMessage = useCallback(
    (message: Message) => {
      if (message.roomId === selectedChat.id) {
        queryClient.setQueryData(
          ["messages", selectedChat.id],
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return [message];

            return [...oldMessages, message];
          },
        );
      }
    },
    [selectedChat.id, queryClient],
  );

  const handleSendMessage = () => {
    webSocketClient.sendMessage(newMessage, selectedChat.id);

    setNewMessage("");
  };

  useEffect(() => {
    webSocketClient.connect(handleReceiveMessage);
    webSocketClient.joinRoom(selectedChat.id);

    return () => {
      webSocketClient.leaveRoom(selectedChat.id);
      webSocketClient.disconnect();
    };
  }, [handleReceiveMessage, selectedChat.id]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesData]);

  if (isLoading) {
    return (
      <>
        <ChatHeader
          onLeaveChat={onLeaveChat}
          onEditChat={onEditChat}
          selectedChat={selectedChat}
        />
        <div className="flex w-full max-w-xs flex-col gap-2 mt-2 p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col justify-between">
      <div className="flex min-h-0 flex-1 flex-col">
        <ChatHeader
          onEditChat={onEditChat}
          selectedChat={selectedChat}
          onLeaveChat={onLeaveChat}
        />
        <div
          id="chat-messages"
          ref={messagesContainerRef}
          className="chat-scroll mt-2 flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-4"
        >
          {messagesData?.map((message) => {
            const isCurrentUser = message.userId === user.id;
            const senderTextColorClass = getUserTextColorClass(message.userId);

            return (
              <div
                key={message.id}
                className={clsx(
                  "flex justify-between w-3/4 md:w-1/2 min-w-0 rounded p-2",
                  isCurrentUser
                    ? "self-end bg-gray-900"
                    : "self-start bg-gray-600",
                )}
              >
                <div className="flex gap-2">
                  {!isCurrentUser && selectedChat.type === "GROUP" && (
                    <>
                      <CustomAvatar
                        name={message.user.name}
                        imageUrl={message.user.imageUrl}
                      />
                    </>
                  )}

                  <div className="flex flex-col">
                    {!isCurrentUser && selectedChat.type === "GROUP" && (
                      <p
                        className={clsx(
                          "flex gap-2 mb-2 items-center self-start text-start font-bold wrap-anywhere",
                          senderTextColorClass,
                        )}
                      >
                        {message.user.name}
                      </p>
                    )}
                    <p className="self-start text-start wrap-anywhere text-gray-100">
                      {message.content}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 self-end">
                  {new Date(message.createdAt).toLocaleTimeString(
                    navigator.language,
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    },
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 pb-[env(safe-area-inset-bottom)] px-4">
        <Input
          value={newMessage}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button
          onClick={handleSendMessage}
          className="cursor-pointer"
          disabled={!newMessage.trim()}
          variant="outline"
          size="icon"
          aria-label="Submit"
        >
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );
};

export default ChatList;
