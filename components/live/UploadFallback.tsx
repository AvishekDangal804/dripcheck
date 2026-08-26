"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { MAX_IMAGE_BYTES } from "@/lib/validation";

export function UploadFallback({ onImageSelected }: { onImageSelected: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is too large. Please choose one under 8MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => onImageSelected(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-24 text-center">
      <EditorialHeading as="h2" className="text-center">
        Upload a Fit
      </EditorialHeading>
      <p className="text-near-black/70">Choose a full-body photo and we&rsquo;ll score what&rsquo;s visible.</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button onClick={() => inputRef.current?.click()}>Choose Photo</Button>

      {error && (
        <p role="alert" className="text-sm text-accent-600">
          {error}
        </p>
      )}
    </div>
  );
}
