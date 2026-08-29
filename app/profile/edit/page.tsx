import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { Button } from "@/components/ui/Button";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { isSupabaseConfigured } from "@/lib/env";
import { getMyProfile } from "@/lib/repositories/profileRepo";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageShell className="py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Profiles need an account
        </EditorialHeading>
        <Button href="/signup" size="lg" className="mt-6">
          Sign Up
        </Button>
      </PageShell>
    );
  }

  const { profile } = await getMyProfile();

  if (!profile) {
    return (
      <PageShell className="py-24 text-center">
        <EditorialHeading as="h1" className="text-center">
          Sign in to edit your profile
        </EditorialHeading>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/login" size="lg">
            Log In
          </Button>
          <Button href="/signup" variant="secondary" size="lg">
            Sign Up
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="Profile" as="h1">
        Edit your profile.
      </EditorialHeading>

      <ProfileEditForm
        initialUsername={profile.username ?? ""}
        initialDisplayName={profile.display_name ?? ""}
        initialAvatarUrl={profile.avatar_url}
      />
    </PageShell>
  );
}
