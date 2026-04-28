import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type CustomAvatarProps = {
  name: string;
  imageUrl?: string;
  onClickAvatar?: () => void;
  className?: string;
};

const CustomAvatar = ({
  name,
  imageUrl,
  onClickAvatar,
  className,
}: CustomAvatarProps) => {
  const getNameInitials = (name: string) => {
    const nameParts = name.split(" ");
    const initials =
      nameParts[0].charAt(0).toUpperCase() +
      (nameParts[1]?.charAt(0).toUpperCase() || "");
    return initials;
  };

  return (
    <Avatar onClick={onClickAvatar} className={className}>
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback>{getNameInitials(name)}</AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
