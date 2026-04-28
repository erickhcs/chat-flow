import useUserContext from "@/contexts/hooks/user";

import type { Chat } from "@/types";
import { LogoutAction } from "./logoutAction";
import { CreateChatAction } from "./createChatAction";
import { SearchChatAction } from "./searchChatAction";

interface ActionsHeaderProps {
  onAddChat: (newChat: Chat) => void;
}

const ActionsHeader = ({ onAddChat }: ActionsHeaderProps) => {
  const { user } = useUserContext();

  return (
    <div className="bg-gray-900 p-4 flex justify-between border-b-2">
      <div className="flex items-center gap-5">
        <p>{user?.name}</p>

        <CreateChatAction onAddChat={onAddChat} />
        <SearchChatAction onAddChat={onAddChat} />
      </div>
      <LogoutAction />
    </div>
  );
};

export default ActionsHeader;
