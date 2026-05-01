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
  ArrowLeft,
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
import useDeleteRoom from "@/hooks/useDeleteRoom";
import useIsMobile from "@/hooks/useIsMobile";

type ChatHeaderProps = {
  selectedChatId: number;
  onLeaveChat: () => void;
  onEditChat: (chat: Chat) => void;
};

const ChatHeader = ({
  selectedChatId,
  onLeaveChat,
  onEditChat,
}: ChatHeaderProps) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteRoom, isPending: isDeletingRoom } =
    useDeleteRoom();
  const [isOpenDeleteChatDialog, setIsOpenDeleteChatDialog] = useState(false);
  const [isOpenLeaveChatDialog, setIsOpenLeaveChatDialog] = useState(false);
  const { mutateAsync: postLeaveRoom, isPending: isLeavingRoom } =
    usePostLeaveRoom();
  const selectedChat: Chat = (
    queryClient.getQueryData(["rooms"]) as Chat[] | undefined
  )?.find((chat: Chat) => chat.id === selectedChatId) as Chat;
  const canEdit =
    selectedChat.type === "GROUP" &&
    selectedChat.users.find((u) => u.id === user?.id) &&
    selectedChat.users.find((u) => u.id === user?.id)?.role === "ADMIN";
  const [isOpenEditChatDrawer, setIsOpenEditChatDrawer] = useState(false);
  const isMobile = useIsMobile();

  const handleEditChatButtonClick = () => {
    setIsOpenEditChatDrawer(true);
  };

  const handleLeaveGroupOptionClick = async () => {
    await postLeaveRoom({ roomId: selectedChatId });

    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return oldRooms;

      return oldRooms.filter((chat) => chat.id !== selectedChatId);
    });

    webSocketClient.leaveRoom(selectedChatId);
    onLeaveChat();
  };

  const deleteRoomOptionClick = async () => {
    await deleteRoom({ roomId: selectedChatId });

    queryClient.setQueryData(["rooms"], (oldRooms: Chat[] | undefined) => {
      if (!oldRooms) return oldRooms;

      return oldRooms.filter((chat) => chat.id !== selectedChatId);
    });

    webSocketClient.leaveRoom(selectedChatId);
    onLeaveChat();
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b-2 bg-gray-900">
        <div className="flex justify-start items-center gap-3">
          {isMobile && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={onLeaveChat}
            >
              <ArrowLeft />
            </Button>
          )}
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
                  onSelect={() => setIsOpenDeleteChatDialog(true)}
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
        open={isOpenDeleteChatDialog}
        onOpenChange={setIsOpenDeleteChatDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isDeletingRoom}
              onClick={() => setIsOpenDeleteChatDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              disabled={isDeletingRoom}
              variant="destructive"
              onClick={deleteRoomOptionClick}
            >
              Delete
              {isDeletingRoom && (
                <Spinner data-icon="inline-start" className="ml-2" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
