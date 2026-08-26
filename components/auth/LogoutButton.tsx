"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="md"
      onClick={async () => {
        await getSupabaseBrowserClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Log Out
    </Button>
  );
}
