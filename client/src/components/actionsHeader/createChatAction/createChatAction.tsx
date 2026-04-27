import { MessageCirclePlus } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import useFetch from "@/hooks/useFetch";
import type { Chat } from "@/types";
import { Input } from "@/components/ui/input";
import uploadImage from "@/lib/uploadImage";

const createChatSchema = z.object({
  name: z.string().min(5, "Chat name must be at least 5 characters"),
  cover: z
    .any()
    .refine((files) => files?.length === 1, "Image is required")
    .transform((files) => files?.[0])
    .refine((file) => file.size <= 2 * 1024 * 1024, "Max 2MB")
    .refine(
      (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Invalid image type",
    ),
});

type CreateChatFormData = z.infer<typeof createChatSchema>;

interface CreateChatActionProps {
  onAddChat: (newChat: Chat) => void;
}

const CreateChatAction = ({ onAddChat }: CreateChatActionProps) => {
  const { fetchApiWithAuth } = useFetch();
  const [isOpenCreateChatDrawer, setIsOpenCreateChatDrawer] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateChatFormData>({
    resolver: zodResolver(createChatSchema),
    defaultValues: { name: "", cover: undefined },
  });

  const handleClickCreateChatButton = () => {
    setIsOpenCreateChatDrawer(true);
  };

  const handleCreateChat = async (data: CreateChatFormData) => {
    try {
      const imageUrl = await uploadImage(data.cover, "rooms/");

      const response = await fetchApiWithAuth(
        `${import.meta.env.VITE_API_URL}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, imageUrl }),
        },
      );

      if (!response) return;

      const newChat = await response.json();

      onAddChat(newChat);
      setIsOpenCreateChatDrawer(false);

      reset();
    } catch (error) {
      console.error("Error creating chat: ", error);
    }
  };

  return (
    <>
      <Button
        onClick={handleClickCreateChatButton}
        variant="outline"
        size="icon"
        className="cursor-pointer"
      >
        <MessageCirclePlus />
      </Button>

      <Drawer
        direction="left"
        open={isOpenCreateChatDrawer}
        onOpenChange={setIsOpenCreateChatDrawer}
      >
        <DrawerContent>
          <form onSubmit={handleSubmit(handleCreateChat)}>
            <DrawerHeader>
              <DrawerTitle>Create Chat</DrawerTitle>
              <DrawerDescription>
                Enter the details for the new chat below.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <Label htmlFor="name">Chat name</Label>
              <Input
                disabled={isSubmitting}
                {...register("name")}
                id="name"
                type="text"
                className="mt-4"
                placeholder="Chat name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm pt-2">
                  {errors.name.message}
                </p>
              )}

              <Label htmlFor="cover" className="mt-7">
                Cover image
              </Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                disabled={isSubmitting}
                {...register("cover")}
                className="mt-4"
                placeholder="Cover image"
              />
              {errors.cover && (
                <p className="text-red-500 text-sm pt-2">
                  {typeof errors.cover.message === "string"
                    ? errors.cover.message
                    : "Invalid cover image"}
                </p>
              )}
            </div>
            <DrawerFooter className="flex">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full"
              >
                Create
              </Button>
              <DrawerClose asChild>
                <Button
                  className="cursor-pointer"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    reset();
                    clearErrors();
                    setIsOpenCreateChatDrawer(false);
                  }}
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
};
export default CreateChatAction;
