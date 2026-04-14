import { Skeleton } from "@/components/ui/skeleton";
import type { Chat, Message } from "@/types";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import WebSocketClient from "@/websocket";
import useFetch from "@/hooks/useFetch";

type ChatProps = {
  selectedChat: Chat;
};

const ChatList = ({ selectedChat }: ChatProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchParams] = useSearchParams();
  const [newMessage, setNewMessage] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const userId = searchParams.get("userId");
  const { fetchApiWithAuth } = useFetch();

  const handleReceiveMessage = useCallback(
    (message: Message) => {
      if (message.roomId === selectedChat.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    },
    [selectedChat.id],
  );

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);

        const response = await fetchApiWithAuth(
          `http://localhost:3000/messages/${selectedChat.id}`,
        );
        if (!response) return;
        console.log("Response: ", response);
        const data = await response.json();
        console.log("Data: ", data);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching chat messages: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    const connectWebSocket = () => {
      WebSocketClient.getInstance(
        Number(userId),
        handleReceiveMessage,
      ).joinRoom(selectedChat.id);
    };

    connectWebSocket();
    fetchMessages();

    // return () => {
    //   WebSocketClient.getInstance(
    //     Number(userId),
    //     handleReceiveMessage,
    //   ).disconnect();
    // };
  }, [selectedChat, userId, handleReceiveMessage]);

  const handleSendMessage = () => {
    WebSocketClient.getInstance(
      Number(userId),
      handleReceiveMessage,
    ).sendMessage(newMessage, selectedChat.id);

    setNewMessage("");
  };

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  if (isLoading) {
    return (
      <>
        <p>{selectedChat.name}</p>
        <div className="flex w-full max-w-xs flex-col gap-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <p>{selectedChat.name}</p>
        <div
          id="chat-messages"
          ref={messagesContainerRef}
          className="flex flex-col gap-4 mt-2 max-h-[87vh] overflow-y-auto"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                "p-2 rounded w-1/2 flex flex-col",
                message.userId === Number(userId)
                  ? "self-end bg-gray-900"
                  : "self-start bg-gray-600",
              )}
            >
              <p className="self-start">{message.content}</p>
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
          ))}
        </div>
      </div>
      <div className="flex gap-2">
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
