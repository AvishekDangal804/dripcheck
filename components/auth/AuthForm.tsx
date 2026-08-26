"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/clientConfig";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfiguredClient()) {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Accounts aren&rsquo;t set up yet
        </EditorialHeading>
        <p className="mt-4 text-near-black/70">
          DripCheck is running in guest mode. You can still take a Live Fit Check and enter the leaderboard without
          signing in.
        </p>
        <Button href="/live" size="lg" className="mt-6">
          Try Live Fit Check
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-5 py-20">
      <EditorialHeading as="h1" className="text-center">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </EditorialHeading>

      {mode === "signup" && (
        <div>
          <label htmlFor="displayName" className="text-xs uppercase tracking-wide text-near-black/60">
            Name
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 w-full border-b border-near-black/30 bg-transparent py-2 outline-none focus:border-accent-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-xs uppercase tracking-wide text-near-black/60">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full border-b border-near-black/30 bg-transparent py-2 outline-none focus:border-accent-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-xs uppercase tracking-wide text-near-black/60">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 w-full border-b border-near-black/30 bg-transparent py-2 outline-none focus:border-accent-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-accent-600">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
      </Button>
    </form>
  );
}
