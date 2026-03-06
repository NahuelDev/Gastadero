import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { uploadReceipt } from "../../api/uploads.api.js";

export function ReceiptUpload({
  groupId,
  onUploaded,
}: {
  groupId: string;
  onUploaded: (url: string) => void;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadReceipt(groupId, file);
      onUploaded(url);
    } catch {
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-slate-300 rounded-lg p-4 w-full text-center text-sm text-text-muted hover:border-primary hover:text-primary"
      >
        {uploading ? t("common.loading") : t("expenses.uploadReceipt")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      {preview && (
        <img
          src={preview}
          alt="Receipt"
          className="mt-2 rounded-lg max-h-40 object-cover w-full"
        />
      )}
    </div>
  );
}
