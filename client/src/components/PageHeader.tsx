import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Plain part of the title, e.g. "Everyone hears". */
  title: string;
  /** Word set on a colored sticker after the title, e.g. "this.". */
  sticker?: string;
  /** Tailwind background class for the sticker, e.g. "bg-secondary". */
  stickerFill?: string;
  description?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}

/** Shared section header: heavy title with an optional sticker word, as on the sign-in page. */
export default function PageHeader({
  title,
  sticker,
  stickerFill = "bg-primary",
  description,
  action,
  as: Heading = "h1",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-4 gap-y-3", className)}>
      <div className="min-w-0">
        <Heading className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
          {title}
          {sticker && (
            <>
              {" "}
              <span className={cn("nb-sticker-word", stickerFill)}>{sticker}</span>
            </>
          )}
        </Heading>
        {description && <p className="mt-2 text-sm font-medium text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
