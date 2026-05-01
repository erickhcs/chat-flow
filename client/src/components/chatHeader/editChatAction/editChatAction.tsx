import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usePatchRoom from "@/hooks/usePatchRoom";
import uploadImage from "@/lib/uploadImage";
import type { Chat } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { clsx } from "clsx";
import { Trash, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

const editChatSchema = z.object({
  name: z.string().min(5, "Chat name must be at least 5 characters"),
  preview: z.string().optional(),
  cover: z
    .optional(z.instanceof(File))
    .refine((file) => !file || file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "Max file size is 5MB",
    }),
});

type EditChatFormData = z.infer<typeof editChatSchema>;

interface EditChatActionProps {
  onEditChat: (chat: Chat) => void;
  selectedChat: Chat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditChatAction = ({
  open,
  selectedChat,
  onEditChat,
  onOpenChange,
}: EditChatActionProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EditChatFormData>({
    resolver: zodResolver(editChatSchema),
    defaultValues: {
      name: selectedChat.name,
      preview: selectedChat.imageUrl,
      cover: undefined,
    },
  });
  const { mutateAsync: patchRoom } = usePatchRoom();
  const { name, preview } = useWatch({ control });

  const onDrop = (files: File[]) => {
    if (files[0]) {
      setValue("cover", files[0], { shouldValidate: true });

      if (preview) URL.revokeObjectURL(preview);
      setValue("preview", URL.createObjectURL(files[0]));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop,
    multiple: false,
  });

  const handleRemoveCover = () => {
    setValue("preview", undefined, { shouldValidate: true });
    setValue("cover", undefined, { shouldValidate: true });
  };

  const getImageUrl = async (dataCover?: File) => {
    if (preview === selectedChat.imageUrl) return selectedChat.imageUrl;

    return dataCover ? await uploadImage(dataCover, "rooms/") : null;
  };

  const handleEditChat = async (data: EditChatFormData) => {
    try {
      const imageUrl = await getImageUrl(data.cover);

      const newChat = await patchRoom({
        roomId: selectedChat.id,
        name: data.name,
        imageUrl,
      });

      onEditChat(newChat);
      onOpenChange(false);

      reset();
    } catch (error) {
      console.error("Error editing chat: ", error);
    }
  };

  return (
    <>
      <Drawer
        direction="right"
        open={open}
        onOpenChange={onOpenChange}
        onClose={() => reset()}
      >
        <DrawerContent>
          <form onSubmit={handleSubmit(handleEditChat)}>
            <DrawerHeader>
              <DrawerTitle>Edit Chat</DrawerTitle>
              <DrawerDescription>
                Enter the details for the chat below.
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

              <Card
                className={clsx(
                  "flex w-full aspect-square justify-center mt-4 relative",
                  !preview && "cursor-pointer",
                )}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="object-cover" />
                    <Button
                      onClick={handleRemoveCover}
                      variant="outline"
                      size="icon"
                      className="cursor-pointer absolute top-2 right-2 text-gray-900 border-gray-900! bg-gray-300! hover:bg-gray-400! hover:text-gray-900"
                    >
                      <Trash />
                    </Button>
                  </>
                ) : (
                  <div
                    {...getRootProps()}
                    className="flex flex-col justify-center items-center w-full h-full"
                  >
                    <input {...getInputProps()} />
                    <Upload />
                    <p className="text-center">Drag image here or click</p>
                  </div>
                )}
              </Card>

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
                disabled={
                  isSubmitting ||
                  Object.keys(errors).length > 0 ||
                  (selectedChat.name === name?.trim() &&
                    preview === selectedChat.imageUrl)
                }
                className="cursor-pointer w-full"
              >
                Edit
              </Button>
              <DrawerClose asChild>
                <Button
                  className="cursor-pointer"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    reset();
                    clearErrors();
                    onOpenChange(false);
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

export default EditChatAction;
