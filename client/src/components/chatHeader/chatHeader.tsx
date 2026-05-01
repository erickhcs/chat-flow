import { CustomAvatar } from "@/components/customAvatar";
import { EditChatAction } from "./editChatAction";
import type { Chat } from "@/types";
import useUserContext from "@/contexts/hooks/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  EllipsisVertical,
  Pencil,
  TrashIcon,
  SquareArrowRightExit,
} from "lucide-react";
import { useState } from "react";
import { webSocketClient } from "@/websocket";
import usePostLeaveRoom from "@/hooks/usePostLeaveRoom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";

type ChatHeaderProps = {
  selectedChat: Chat;
  onLeaveChat: () => void;
  onEditChat: (chat: Chat) => void;
};

const ChatHeader = ({
  selectedChat,
  onLeaveChat,
  onEditChat,
}: ChatHeaderProps) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [isOpenLeaveChatDialog, setIsOpenLeaveChatDialog] = useState(false);
  const { mutateAsync: postLeaveRoom, isPending: isLeavingRoom } =
    usePostLeaveRoom();
  const canEdit =
    selectedChat.type === "GROUP" &&
    selectedChat.users.find((u) => u.id === user?.id) &&
    selectedChat.users.find((u) => u.id === user?.id)?.role === "ADMIN";
  const [isOpenEditChatDrawer, setIsOpenEditChatDrawer] = useState(false);

  const handleEditChatButtonClick = () => {
    setIsOpenEditChatDrawer(true);
  };

  const handleLeaveGroupOptionClick = async () => {
    await postLeaveRoom({ roomId: selectedChat.id });

    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return oldRooms;

      return oldRooms.filter((chat) => chat.id !== selectedChat.id);
    });

    webSocketClient.leaveRoom(selectedChat.id);
    onLeaveChat();
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b-2 bg-gray-900">
        <div className="flex justify-start items-center gap-3">
          <CustomAvatar
            name={selectedChat.name}
            imageUrl={selectedChat.imageUrl}
          />
          <p>{selectedChat.name}</p>
        </div>
        {selectedChat.type === "GROUP" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem
                  onSelect={handleEditChatButtonClick}
                  className="cursor-pointer"
                >
                  <Pencil />
                  Edit
                </DropdownMenuItem>
              )}

              {canEdit && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onSelect={() => setIsOpenLeaveChatDialog(true)}
                variant="destructive"
                className="cursor-pointer"
              >
                <SquareArrowRightExit />
                Leave group
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <TrashIcon />
                  Delete group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <EditChatAction
        open={isOpenEditChatDrawer}
        onEditChat={onEditChat}
        onOpenChange={setIsOpenEditChatDrawer}
        selectedChat={selectedChat}
      />

      <Dialog
        open={isOpenLeaveChatDialog}
        onOpenChange={setIsOpenLeaveChatDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this group?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isLeavingRoom}
              onClick={() => setIsOpenLeaveChatDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              disabled={isLeavingRoom}
              variant="destructive"
              onClick={handleLeaveGroupOptionClick}
            >
              Leave
              {isLeavingRoom && (
                <Spinner data-icon="inline-start" className="ml-2" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatHeader;
