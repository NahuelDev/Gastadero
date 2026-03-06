export function generateUploadKey(
  groupId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const ext = filename.split(".").pop() ?? "jpg";
  return `receipts/${groupId}/${timestamp}.${ext}`;
}
