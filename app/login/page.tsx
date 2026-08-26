import { PageShell } from "@/components/layout/PageShell";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <PageShell>
      <AuthForm mode="login" />
    </PageShell>
  );
}
