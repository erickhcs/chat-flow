import { supabase } from "./supabase";

async function uploadImage(file: File, filePath: string) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const rawPath = `${filePath}/${fileName}`;

  const { error } = await supabase.storage
    .from("chat-data")
    .upload(rawPath, file, {
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("chat-data").getPublicUrl(rawPath);

  return data.publicUrl;
}

export default uploadImage;
