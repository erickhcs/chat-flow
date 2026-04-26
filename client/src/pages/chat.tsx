import { ChatList } from "@/components/chatList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useUserContext from "@/contexts/hooks/user";
import useFetch from "@/hooks/useFetch";
import type { Chat } from "@/types";
import { useEffect, useState } from "react";
import { SquareArrowRightExit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat>();
  const [isOpenLogoutDialog, setIsOpenLogoutDialog] = useState(false);
  const { fetchApiWithAuth } = useFetch();
  const { user, setUser, setIsAuthenticated, setToken } = useUserContext();
  const navigate = useNavigate();

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

  const handleClickLogoutButton = () => {
    setIsOpenLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);

    navigate("/login");
  };

  return (
    <>
      <div className="flex flex-col overflow-y-auto">
        <div className="bg-gray-600 p-3 flex justify-between">
          <p>{user?.name}</p>
          <Button
            onClick={handleClickLogoutButton}
            variant="outline"
            size="icon"
            className="cursor-pointer"
          >
            <SquareArrowRightExit />
          </Button>
        </div>
        <div className="flex h-svh w-full min-h-0 overflow-hidden">
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
      </div>

      <Dialog open={isOpenLogoutDialog} onOpenChange={setIsOpenLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
            <div className="flex gap-2 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsOpenLogoutDialog(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button onClick={handleConfirmLogout} className="cursor-pointer">
                Logout
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatPage;
