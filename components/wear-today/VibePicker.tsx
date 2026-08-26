import { VibeCard } from "@/components/wear-today/VibeCard";
import { listVibes, type VibeKey } from "@/services/outfits/vibeTemplates";

interface VibePickerProps {
  onSelect: (vibe: VibeKey) => void;
  onRandom: () => void;
}

export function VibePicker({ onSelect, onRandom }: VibePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {listVibes().map((template) => (
        <VibeCard key={template.vibe} label={template.label} onClick={() => onSelect(template.vibe)} />
      ))}
      <VibeCard label="Random" onClick={onRandom} />
    </div>
  );
}
