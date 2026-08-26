"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/clientConfig";

type Action = "like" | "save";

export function LikeSaveButtons({ outfitId }: { outfitId: string }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handle(action: Action) {
    if (!isSupabaseConfiguredClient()) {
      setNotice("Sign in to like or save outfits.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setNotice("Sign in to like or save outfits.");
      return;
    }

    setNotice(null);
    const endpoint = `/api/outfits/${outfitId}/${action}`;
    const isActive = action === "like" ? liked : saved;
    const setActive = action === "like" ? setLiked : setSaved;

    setActive(!isActive);
    const res = await fetch(endpoint, { method: isActive ? "DELETE" : "POST" });
    if (!res.ok) setActive(isActive);
  }

  return (
    <div className="relative flex items-center gap-3 text-xs uppercase tracking-wide">
      <button
        type="button"
        onClick={() => handle("like")}
        aria-pressed={liked}
        className={liked ? "text-accent-600" : "text-near-black/50 hover:text-accent-600"}
      >
        {liked ? "Liked" : "Like"}
      </button>
      <button
        type="button"
        onClick={() => handle("save")}
        aria-pressed={saved}
        className={saved ? "text-accent-600" : "text-near-black/50 hover:text-accent-600"}
      >
        {saved ? "Saved" : "Save"}
      </button>

      {notice && (
        <span role="status" className="absolute top-full left-0 mt-1 w-40 text-[11px] normal-case tracking-normal text-near-black/60">
          {notice}
        </span>
      )}
    </div>
  );
}
