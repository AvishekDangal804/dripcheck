import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { WearTodayTemplates } from "@/components/wear-today/WearTodayTemplates";
import { WearTodayFromCloset } from "@/components/wear-today/WearTodayFromCloset";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listCloset } from "@/lib/repositories/closetRepo";

export const dynamic = "force-dynamic";

export default async function WearTodayPage() {
  let closetMode = false;

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const closet = await listCloset(data.user.id);
      const hasTop = closet.some((i) => i.category === "tshirt" || i.category === "shirt");
      const hasBottom = closet.some((i) => ["pants", "jeans", "shorts"].includes(i.category));
      closetMode = hasTop && hasBottom;
    }
  }

  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="What Can I Wear Today?" as="h1" className="mb-10 text-center mx-auto">
        What&rsquo;s your vibe today?
      </EditorialHeading>

      {closetMode ? <WearTodayFromCloset /> : <WearTodayTemplates />}
    </PageShell>
  );
}
