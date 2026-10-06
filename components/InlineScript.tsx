// React (in this Next.js version) warns about <script> tags rendered
// directly — they're inert on client re-renders. type="text/javascript" on
// the server lets it run during HTML parsing (before hydration); switching
// to type="text/plain" on the client avoids the warning and re-execution.
// See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
