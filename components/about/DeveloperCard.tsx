import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

export function DeveloperCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="group flex flex-col items-center gap-4 rounded-sm border border-stone/60 bg-warm-white p-8 text-center transition-transform duration-200 hover:-translate-y-1">
      <InitialsAvatar name={name} className="h-20 w-20 text-2xl transition-colors duration-200 group-hover:bg-accent-600" />
      <div>
        <p className="font-display text-xl text-near-black">{name}</p>
        <p className="text-xs uppercase tracking-wide text-accent-500">{role}</p>
      </div>
    </div>
  );
}
