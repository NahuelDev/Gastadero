import { getToken } from "./client.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export async function uploadReceipt(
  groupId: string,
  file: File
): Promise<string> {
  const token = getToken();
  const res = await fetch(
    `${API_URL}/uploads/receipt?groupId=${groupId}&filename=${file.name}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
      },
      body: file,
    }
  );

  if (!res.ok) throw new Error("Upload failed");

  const { url } = (await res.json()) as { url: string };
  return `${API_URL}/uploads/receipt/${url}`;
}
