// Lightweight, dependency-free hover/focus tooltip — pure CSS (group-hover),
// so it works for both mouse and keyboard focus without any JS state. Wrap
// any icon-only control or ambiguous element in it; the wrapped element
// keeps its own aria-label for screen readers, this is the visual hint.
export default function Tooltip({
  label,
  side = "bottom",
  children,
}: {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}) {
  const position = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
    left: "right-full top-1/2 mr-2 -translate-y-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
  }[side];

  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-50 ${position} whitespace-nowrap rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
