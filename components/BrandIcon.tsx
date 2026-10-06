import { CATEGORIES, getCategoryEmoji } from "@/lib/categories";
import Tooltip from "@/components/Tooltip";

function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/** A brand's icon tile — one big category emoji when the brand is being
 *  viewed within a single category (📱 for a phone brand, 💻 for a laptop
 *  brand, ...), or a row of emoji when showing every category a brand spans
 *  (e.g. Apple: 📱💻🎧). A multi-category tile grows a little wider to fit
 *  its icons and shrinks them as more are packed in, so a brand covering
 *  more categories reads as a bigger tile instead of spilling its icons
 *  outside a fixed square. */
export default function BrandIcon({
  categories,
  gradient,
  size = "md",
}: {
  categories: string[];
  gradient: string;
  size?: "sm" | "md" | "lg";
}) {
  const height = { sm: "h-10", md: "h-14", lg: "h-16" }[size];
  const minWidth = { sm: "min-w-10", md: "min-w-14", lg: "min-w-16" }[size];
  const count = categories.length;
  const multi = count > 1;

  const emojiSize = multi
    ? {
        2: { sm: "text-xs", md: "text-sm", lg: "text-base" },
        3: { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" },
      }[Math.min(count, 3) as 2 | 3][size]
    : { sm: "text-lg", md: "text-2xl", lg: "text-3xl" }[size];

  const tile = (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient} ${height} ${
        multi ? `gap-0.5 px-1.5 ${minWidth}` : `${{ sm: "w-10", md: "w-14", lg: "w-16" }[size]}`
      }`}
    >
      {categories.map((c) => (
        <span key={c} className={emojiSize}>
          {getCategoryEmoji(c)}
        </span>
      ))}
    </div>
  );

  // Only worth a tooltip when the icon alone can't say which categories a
  // brand spans (a single emoji is already unambiguous in context).
  if (!multi) return tile;

  return <Tooltip label={categories.map(categoryLabel).join(", ")}>{tile}</Tooltip>;
}
