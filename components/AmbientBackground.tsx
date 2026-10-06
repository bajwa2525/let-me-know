// Fixed, decorative gradient-blob field behind every page — the same
// drifting-blob language the auth pages already use, extended site-wide so
// the whole app feels alive rather than static. Pure CSS motion (transform
// only), sits below all content via -z-10, and fully stops under
// prefers-reduced-motion (see .ambient-blob rules in globals.css).
export default function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div
        className="ambient-blob bg-accent"
        style={
          {
            top: "-12%",
            left: "-10%",
            width: "40rem",
            height: "40rem",
            opacity: 0.16,
            animationDuration: "28s",
            "--drift-x": "6%",
            "--drift-y": "5%",
          } as React.CSSProperties
        }
      />
      <div
        className="ambient-blob bg-accent-2"
        style={
          {
            top: "22%",
            right: "-14%",
            width: "36rem",
            height: "36rem",
            opacity: 0.13,
            animationDuration: "32s",
            animationDelay: "-10s",
            "--drift-x": "-5%",
            "--drift-y": "6%",
          } as React.CSSProperties
        }
      />
      <div
        className="ambient-blob bg-accent-3"
        style={
          {
            bottom: "-16%",
            left: "22%",
            width: "42rem",
            height: "42rem",
            opacity: 0.11,
            animationDuration: "36s",
            animationDelay: "-20s",
            "--drift-x": "5%",
            "--drift-y": "-6%",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
