import { StorageClient } from "@supabase/storage-js";
import { env, validateEnv } from "../config/env.js";

validateEnv();

const STORAGE_URL = `${env.supabaseUrl}/storage/v1`;
const SERVICE_KEY = env.supabaseSecretKey;
const EXPIRE_IN = 3600;

const storageClient = new StorageClient(STORAGE_URL, {
  apikey: SERVICE_KEY ?? "",
  Authorization: `Bearer ${SERVICE_KEY}`,
});

const regularBucket = storageClient.from("Docs");

export async function uploadFile(name: string, file: Express.Multer.File) {
  const { data, error } = await regularBucket.upload(name, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });

  if (error || !data?.path) {
    console.error("Failed to upload supabase file:", error);
    throw error ?? new Error("Failed to upload supabase file");
  }

  return data.path;
}

export async function getFileUrl(path: string) {
  const { data, error } = await regularBucket.createSignedUrl(path, EXPIRE_IN);

  if (error || !data?.signedUrl) {
    console.error("Failed to get supabase file url:", error);
    throw error ?? new Error("Failed to get supabase file url");
  }

  return data.signedUrl;
}

export async function deleteFile(path: string) {
  const { error } = await regularBucket.remove([path]);

  if (error) {
    console.error("Failed to delete supabase file:", error);
    throw error;
  }
}
