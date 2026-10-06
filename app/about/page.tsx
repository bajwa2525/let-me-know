import Breadcrumbs from "@/components/Breadcrumbs";

const PRINCIPLES = [
  {
    title: "No clutter, no ad-walls",
    body: "Specs load instantly and stay readable — no pop-ups, no five-page spec tables you have to scroll through on mobile.",
  },
  {
    title: "Built for how people actually browse",
    body: "Swipe through phones the way you already scroll reels — up/down for the next device, left/right to dig into specs, camera, and verdict.",
  },
  {
    title: "Opinionated verdicts, not just numbers",
    body: "Every phone gets a plain-language verdict with real pros and cons, not just a spec sheet copy-pasted from the manufacturer.",
  },
  {
    title: "Fast on any device",
    body: "A modern, lightweight build means the site feels instant, even on a mid-range phone with a shaky connection.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
        <span className="glass mb-6 inline-block rounded-full px-4 py-1.5 text-xs text-muted">
          About Let Me Know
        </span>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          We built the phone-spec site we{" "}
          <span className="text-gradient">actually wanted to use.</span>
        </h1>
        <p className="mb-10 text-muted">
          Sites like GSMArena carry the most complete phone database on the internet
          — but browsing it still feels like 2010: dense tables, tiny text, and an
          experience that was never designed for a phone screen. Let Me Know keeps
          the depth of information people rely on, and rebuilds the experience
          around it — fast, visual, and swipeable.
        </p>

        <h2 className="mb-4 text-xl font-semibold">What we&apos;re fixing</h2>
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <div key={item.title} className="glass rounded-2xl p-5">
              <h3 className="mb-2 font-medium">{item.title}</h3>
              <p className="text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-xl font-semibold">Where we&apos;re headed</h2>
        <p className="text-sm text-muted">
          We&apos;re an early build covering a handful of real, recent flagship
          phones with real specs and real product photos (sourced from
          Wikimedia Commons). Next up: a full phone database, AI-assisted spec
          verification, side-by-side comparisons, and personalized
          recommendations based on how you actually use your phone.
        </p>
      </div>
    </main>
  );
}
