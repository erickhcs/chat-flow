import { motion } from "framer-motion";
import clsx from "clsx";
import { Spinner } from "@/components/ui/spinner";
import CustomAvatar from "@/components/customAvatar/customAvatar";
import useUserContext from "@/contexts/hooks/user";
import type { Chat } from "@/types";
import useIsMobile from "@/hooks/useIsMobile";

type RoomListProps = {
  isLoadingChats: boolean;
  chats: Chat[] | undefined;
  selectedChatId: number | undefined;
  setSelectedChatId: (id: number) => void;
};

const RoomList = ({
  isLoadingChats,
  chats,
  selectedChatId,
  setSelectedChatId,
}: RoomListProps) => {
  const { user } = useUserContext();
  const isMobile = useIsMobile();

  return (
    <div
      className={clsx("flex flex-col", {
        "gap-1": !isMobile,
      })}
    >
      {isLoadingChats ? (
        <div className="flex justify-center mt-2">
          <Spinner data-icon="inline-start" className="ml-2" />
        </div>
      ) : (
        chats?.map((chat) => (
          <motion.div
            layout
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)}
            className={clsx(
              "flex items-center gap-4 cursor-pointer hover:bg-gray-700 p-2 rounded-sm border-b-2 md:border-0",
              selectedChatId === chat.id && "bg-gray-600",
            )}
          >
            <CustomAvatar name={chat.name} imageUrl={chat.imageUrl} />

            <div className="min-w-0 flex-1">
              <p className="text-start truncate">{chat.name}</p>
              <p className="text-start text-gray-500 text-sm truncate">
                {chat.lastMessageUserName && chat.type === "GROUP"
                  ? `${chat.lastMessageUserId === user?.id ? "You" : chat.lastMessageUserName.split(" ")[0]}: `
                  : ""}
                {chat.lastMessageContent}
              </p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default RoomList;
