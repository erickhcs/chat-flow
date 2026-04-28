import { MessageCirclePlus, Trash, Upload } from "lucide-react";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
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
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import clsx from "clsx";

const createChatSchema = z.object({
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
    control,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateChatFormData>({
    resolver: zodResolver(createChatSchema),
    defaultValues: { name: "", preview: undefined, cover: undefined },
  });
  const { preview } = useWatch({ control });

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

  const handleClickCreateChatButton = () => {
    setIsOpenCreateChatDrawer(true);
  };

  const handleCreateChat = async (data: CreateChatFormData) => {
    try {
      const imageUrl = data.cover
        ? await uploadImage(data.cover, "rooms/")
        : undefined;

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

  const handleRemoveCover = () => {
    setValue("preview", undefined, { shouldValidate: true });
    setValue("cover", undefined, { shouldValidate: true });
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
        onClose={() => reset()}
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
