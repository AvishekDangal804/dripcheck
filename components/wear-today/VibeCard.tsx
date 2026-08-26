import { EditorialVisual } from "@/components/ui/EditorialVisual";

export function VibeCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left transition-transform duration-200 hover:-translate-y-1"
    >
      <EditorialVisual seed={label} label={label} className="aspect-square w-full rounded-sm" />
    </button>
  );
}
