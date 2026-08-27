import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-sm",
        className,
      )}
    >
      V
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-8 w-8 text-base" />
      <span className="text-lg font-semibold tracking-tight text-slate-900">Victor</span>
    </div>
  );
}
