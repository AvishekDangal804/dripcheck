import { cn } from "@/lib/utils";

interface EditorialHeadingProps {
  eyebrow?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: React.ReactNode;
}

const sizeByLevel = {
  h1: "text-5xl md:text-7xl",
  h2: "text-3xl md:text-5xl",
  h3: "text-2xl md:text-3xl",
};

export function EditorialHeading({ eyebrow, as = "h2", className, children }: EditorialHeadingProps) {
  const Heading = as;

  return (
    <div>
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent-500">{eyebrow}</p>
      )}
      <Heading className={cn(sizeByLevel[as], "font-normal leading-[1.05] text-near-black", className)}>
        {children}
      </Heading>
    </div>
  );
}
