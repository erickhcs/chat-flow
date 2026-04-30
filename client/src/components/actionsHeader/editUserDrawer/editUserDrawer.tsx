import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import uploadImage from "@/lib/uploadImage";
import { useForm, useWatch } from "react-hook-form";
import { useUserContext } from "@/contexts/hooks/user";
import { useDropzone } from "react-dropzone";
import type { User } from "@/types";
import { Card } from "@/components/ui/card";
import { clsx } from "clsx";
import { Trash, Upload } from "lucide-react";

interface EditUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAME_MAX_LENGTH = 50;

const editUserSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(NAME_MAX_LENGTH, "Name must be at most 50 characters"),
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

type EditUserFormData = z.infer<typeof editUserSchema>;

const EditUserDrawer = ({ open, onOpenChange }: EditUserDrawerProps) => {
  const { user, setUser } = useUserContext();
  const { fetchApiWithAuth } = useFetch();
  const {
    register,
    setValue,
    reset,
    clearErrors,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user?.name,
      preview: user?.imageUrl,
      cover: undefined,
    },
  });

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
    if (preview === (user as User).imageUrl) return (user as User).imageUrl;

    return dataCover ? await uploadImage(dataCover, "rooms/") : null;
  };

  const handleEditUser = async (data: EditUserFormData) => {
    try {
      const imageUrl = await getImageUrl(data.cover);

      const response = await fetchApiWithAuth(
        `${import.meta.env.VITE_API_URL}/users/${(user as User).id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, imageUrl }),
        },
      );

      if (!response) return;

      const newUser: User = await response.json();

      localStorage.setItem("user", JSON.stringify({ ...user, ...newUser }));
      setUser(newUser);
      onOpenChange(false);

      reset();
    } catch (error) {
      console.error("Error editing user: ", error);
    }
  };

  return (
    <Drawer
      direction="left"
      open={open}
      onOpenChange={onOpenChange}
      onClose={() => reset()}
    >
      <DrawerContent>
        <form onSubmit={handleSubmit(handleEditUser)}>
          <DrawerHeader>
            <DrawerTitle>Edit User</DrawerTitle>
            <DrawerDescription>
              Enter the details for the user below.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <Label htmlFor="name">User name</Label>
            <Input
              disabled={isSubmitting}
              {...register("name")}
              id="name"
              type="text"
              className="mt-4"
              placeholder="User name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm pt-2">{errors.name.message}</p>
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
                ((user as User).name === name?.trim() &&
                  preview === (user as User).imageUrl)
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
  );
};

export default EditUserDrawer;
