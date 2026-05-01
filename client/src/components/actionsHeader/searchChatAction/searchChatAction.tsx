import type { Chat, User } from "@/types";
import { UserSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CustomAvatar } from "@/components/customAvatar";
import useGetRoomsSearch from "@/hooks/useGetRoomsSearch";
import usePostPrivateRoom from "@/hooks/usePostPrivateRoom";
import usePostJoinRoom from "@/hooks/usePostJoinRoom";

interface SearchChatActionProps {
  onAddChat: (newChat: Chat) => void;
}

const SearchChatAction = ({ onAddChat }: SearchChatActionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { mutateAsync: postJoinRoom } = usePostJoinRoom();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const { mutateAsync: postPrivateRoom } = usePostPrivateRoom();
  const { data: searchedChats, isFetching: isSearching } =
    useGetRoomsSearch(debouncedSearchQuery);
  const [isOpenSearchDrawer, setIsOpenSearchDrawer] = useState(false);
  const [isOpeningPrivateChat, setIsOpeningPrivateChat] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isOpenConfirmJoinGroupDialog, setIsOpenConfirmJoinGroupDialog] =
    useState(false);
  const [selectedSearchedGroup, setSelectedSearchedGroup] =
    useState<Chat | null>(null);
  const [selectedSearchedUser, setSelectedSearchedUser] = useState<User | null>(
    null,
  );

  const handleClickSearchButton = () => {
    setIsOpenSearchDrawer(true);
  };

  const handleClickSearchedGroup = (group: Chat) => {
    setSelectedSearchedGroup(group);
    setIsOpenConfirmJoinGroupDialog(true);
  };

  const handleClickSearchedUser = async (user: User) => {
    setIsOpeningPrivateChat(true);
    setSelectedSearchedUser(user);

    try {
      const privateRoom = await postPrivateRoom({ userId: user.id });

      onAddChat(privateRoom);
      setIsOpenSearchDrawer(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error creating private chat: ", error);
    } finally {
      setIsOpeningPrivateChat(false);
      setSelectedSearchedUser(null);
    }
  };

  const handleConfirmJoinGroup = async () => {
    if (!selectedSearchedGroup) return;

    setIsJoiningGroup(true);

    try {
      const updatedGroup = await postJoinRoom({
        roomId: selectedSearchedGroup.id,
      });

      onAddChat(updatedGroup);
      setIsOpenConfirmJoinGroupDialog(false);
      setIsOpenSearchDrawer(false);
      setSelectedSearchedGroup(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error joining group: ", error);
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <>
      <Button
        onClick={handleClickSearchButton}
        variant="outline"
        size="icon"
        className="cursor-pointer"
      >
        <UserSearch />
      </Button>

      <Drawer
        direction="left"
        open={isOpenSearchDrawer}
        onOpenChange={setIsOpenSearchDrawer}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Search chat or user</DrawerTitle>
            <DrawerDescription>
              Enter the details for the chat or user you want to search below.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <Input
              value={searchQuery}
              onChange={handleSearchQueryChange}
              id="search"
              type="text"
              className="mt-4"
              placeholder="Search chat or user"
            />
          </div>

          {searchedChats && searchedChats.groups.length > 0 && (
            <div className="px-4 mt-6">
              <p className="text-lg font-semibold mb-2">Groups</p>
              <div className="flex flex-col gap-2">
                {searchedChats?.groups.map((group) => (
                  <Button
                    disabled={isOpeningPrivateChat}
                    key={group.id}
                    onClick={() => handleClickSearchedGroup(group)}
                    className="px-2 py-6 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-white text-start font-light justify-start"
                  >
                    <CustomAvatar name={group.name} imageUrl={group.imageUrl} />

                    {group.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {searchedChats && searchedChats.users.length > 0 && (
            <div className="px-4 mt-6">
              <p className="text-lg font-semibold mb-2">Users</p>
              <div className="flex flex-col gap-2">
                {searchedChats.users.map((user) => (
                  <Button
                    disabled={isOpeningPrivateChat}
                    key={user.id}
                    onClick={() => handleClickSearchedUser(user)}
                    className="px-2 py-6 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-white text-start font-light justify-start"
                  >
                    <CustomAvatar name={user.name} imageUrl={user.imageUrl} />
                    {user.name}
                    {selectedSearchedUser?.id === user.id &&
                      isOpeningPrivateChat && (
                        <Spinner data-icon="inline-start" className="ml-2" />
                      )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full flex justify-center mt-7">
            {isSearching && <Spinner data-icon="inline-start" />}
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={isOpenConfirmJoinGroupDialog}
        onOpenChange={setIsOpenConfirmJoinGroupDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm join group</DialogTitle>
            <DialogDescription>
              Are you sure you want to join {selectedSearchedGroup?.name} group?
            </DialogDescription>
            <div className="flex gap-2 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={isJoiningGroup}
                  onClick={() => {
                    setIsOpenConfirmJoinGroupDialog(false);
                    setSelectedSearchedGroup(null);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                disabled={isJoiningGroup}
                onClick={handleConfirmJoinGroup}
                className="cursor-pointer"
              >
                Join
                {isJoiningGroup && <Spinner data-icon="inline-start" />}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchChatAction;
