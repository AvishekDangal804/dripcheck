import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { StorySection } from "@/components/about/StorySection";
import { DeveloperCard } from "@/components/about/DeveloperCard";
import { DEVELOPERS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="About DripCheck" as="h1">
        Confidence starts with what you wear.
      </EditorialHeading>

      <div className="mt-10">
        <StorySection eyebrow="Why DripCheck">
          <p>DripCheck was created around a simple idea: confidence often starts with what you wear.</p>
          <p>
            With the growing influence of fashion and personal style among Gen Z, we wanted to create a platform
            where students can check their fit, discover new styles, get AI-powered feedback, and compete with
            their friends.
          </p>
        </StorySection>

        <StorySection eyebrow="The Idea">
          <p>Some days we dress casually. Some days we try something different. Some days we put together an outfit that makes us feel our best.</p>
          <p>DripCheck turns that everyday experience into something fun and interactive.</p>
        </StorySection>

        <StorySection eyebrow="Why IIC">
          <p>
            At Itahari International College, students don&rsquo;t have a regular college uniform, which means our
            everyday outfits become part of our identity.
          </p>
          <p>DripCheck was created around this environment &mdash; designed especially for IIC students to experiment with fashion, build confidence, get feedback, discover their style, have fun with friends, and compete.</p>
        </StorySection>

        <StorySection eyebrow="Gen Z + Fashion">
          <p>
            DripCheck is not about judging people. It&rsquo;s about helping people discover their style, experiment
            with fashion, and feel more confident in what they wear.
          </p>
        </StorySection>

        <section className="py-12 md:py-16">
          <p className="mb-8 text-xs font-medium uppercase tracking-[0.25em] text-accent-500">Meet the Developers</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {DEVELOPERS.map((dev) => (
              <DeveloperCard key={dev.name} name={dev.name} role={dev.role} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
