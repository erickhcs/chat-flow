import useUserContext from "@/contexts/hooks/user";

import type { Chat, User } from "@/types";
import { LogoutAction } from "./logoutAction";
import { CreateChatAction } from "./createChatAction";
import { SearchChatAction } from "./searchChatAction";
import { CustomAvatar } from "../customAvatar";
import { useState } from "react";
import { EditUserDrawer } from "./editUserDrawer";

interface ActionsHeaderProps {
  onAddChat: (newChat: Chat) => void;
}

const ActionsHeader = ({ onAddChat }: ActionsHeaderProps) => {
  const { user } = useUserContext();
  const [isEditUserDrawerOpen, setIsEditUserDrawerOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-900 p-4 flex justify-between border-b-2">
        <div className="flex items-center gap-5">
          <CustomAvatar
            name={(user as User).name}
            imageUrl={user?.imageUrl}
            className="cursor-pointer"
            onClickAvatar={() => setIsEditUserDrawerOpen(true)}
          />

          <CreateChatAction onAddChat={onAddChat} />
          <SearchChatAction onAddChat={onAddChat} />
        </div>
        <LogoutAction />
      </div>

      <EditUserDrawer
        open={isEditUserDrawerOpen}
        onOpenChange={setIsEditUserDrawerOpen}
      />
    </>
  );
};

export default ActionsHeader;
