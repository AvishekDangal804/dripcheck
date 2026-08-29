"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MAX_IMAGE_BYTES } from "@/lib/validation";

interface ProfileEditFormProps {
  initialUsername: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
}

export function ProfileEditForm({ initialUsername, initialDisplayName, initialAvatarUrl }: ProfileEditFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Avatar must be a JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is too large (max 8MB).");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarDataUrl(result);
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || null,
          displayName: displayName.trim() || null,
          ...(avatarDataUrl ? { avatarDataUrl } : {}),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't save your profile.");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 flex max-w-md flex-col gap-6">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Your avatar" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <InitialsAvatar name={displayName || username || "You"} className="h-16 w-16 text-xl" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <Button type="button" variant="secondary" size="md" onClick={() => fileRef.current?.click()}>
          Change photo
        </Button>
      </div>

      <div>
        <label htmlFor="username" className="text-xs uppercase tracking-wide text-near-black/60">
          Username
        </label>
        <div className="mt-1 flex items-center border-b border-near-black/30 focus-within:border-accent-500">
          <span className="text-near-black/40">@</span>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            maxLength={20}
            className="w-full bg-transparent px-1 py-2 outline-none"
          />
        </div>
        <p className="mt-1 text-[11px] text-near-black/40">3–20 letters, numbers or underscores.</p>
      </div>

      <div>
        <label htmlFor="displayName" className="text-xs uppercase tracking-wide text-near-black/60">
          Display name
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          className="mt-1 w-full border-b border-near-black/30 bg-transparent py-2 outline-none focus:border-accent-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-accent-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Saving…" : "Save Profile"}
        </Button>
        <Button href="/profile" variant="ghost" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}
