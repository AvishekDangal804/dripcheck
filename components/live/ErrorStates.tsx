import { Button } from "@/components/ui/Button";
import { EditorialHeading } from "@/components/ui/EditorialHeading";

interface ErrorStateProps {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function ErrorState({ title, message, primaryLabel, onPrimary, secondaryLabel, onSecondary }: ErrorStateProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-24 text-center">
      <EditorialHeading as="h2" className="text-center">
        {title}
      </EditorialHeading>
      <p className="text-near-black/70">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onPrimary}>{primaryLabel}</Button>
        {secondaryLabel && onSecondary && (
          <Button variant="secondary" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
