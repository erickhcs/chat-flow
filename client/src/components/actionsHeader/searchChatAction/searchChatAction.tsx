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
import useFetch from "@/hooks/useFetch";

type SearchResult = {
  users: User[];
  groups: Chat[];
};

interface SearchChatActionProps {
  onAddChat: (newChat: Chat) => void;
}

const SearchChatAction = ({ onAddChat }: SearchChatActionProps) => {
  const [searchedChats, setSearchedChats] = useState<SearchResult>({
    users: [],
    groups: [],
  });
  const [isOpenSearchDrawer, setIsOpenSearchDrawer] = useState(false);
  const [isOpeningPrivateChat, setIsOpeningPrivateChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpenConfirmJoinGroupDialog, setIsOpenConfirmJoinGroupDialog] =
    useState(false);
  const [selectedSearchedGroup, setSelectedSearchedGroup] =
    useState<Chat | null>(null);
  const [selectedSearchedUser, setSelectedSearchedUser] = useState<User | null>(
    null,
  );
  const { fetchApiWithAuth } = useFetch();

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
      const response = await fetchApiWithAuth(
        `${import.meta.env.VITE_API_URL}/rooms/private/${user.id}`,
        {
          method: "POST",
        },
      );

      if (!response) return;

      const privateRoom = await response.json();

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
      const response = await fetchApiWithAuth(
        `${import.meta.env.VITE_API_URL}/rooms/${selectedSearchedGroup.id}/join`,
        {
          method: "POST",
        },
      );

      if (!response) return;

      const updatedGroup = await response.json();

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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedChats({ users: [], groups: [] });
      return;
    }

    setIsSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetchApiWithAuth(
          `${import.meta.env.VITE_API_URL}/rooms/search?searchQuery=${encodeURIComponent(
            searchQuery,
          )}`,
        );

        if (!response) return;
        const data = await response.json();
        setSearchedChats(data);
      } catch (error) {
        console.error("Error searching chats: ", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search"
              type="text"
              className="mt-4"
              placeholder="Search chat or user"
            />
          </div>

          {searchedChats.groups.length > 0 && (
            <div className="px-4 mt-6">
              <p className="text-lg font-semibold mb-2">Groups</p>
              <div className="flex flex-col gap-2">
                {searchedChats.groups.map((group) => (
                  <Button
                    disabled={isOpeningPrivateChat}
                    key={group.id}
                    onClick={() => handleClickSearchedGroup(group)}
                    className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-white text-start font-light justify-start"
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {searchedChats.users.length > 0 && (
            <div className="px-4 mt-6">
              <p className="text-lg font-semibold mb-2">Users</p>
              <div className="flex flex-col gap-2">
                {searchedChats.users.map((user) => (
                  <Button
                    disabled={isOpeningPrivateChat}
                    key={user.id}
                    onClick={() => handleClickSearchedUser(user)}
                    className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-white text-start font-light justify-start"
                  >
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
