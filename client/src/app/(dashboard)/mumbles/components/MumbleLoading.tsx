import { MumbleMark, Sparkle } from "@/components/brand/BrandMarks";

/** First load of the Mumble inbox: the Mumble mark bobbing while its whisper waves ripple. */
export default function MumbleLoading() {
  return (
    <div role="status" aria-live="polite" className="nb-mumble-loading flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center sm:py-16">
      <div className="relative">
        <MumbleMark className="w-36" />
        <Sparkle className="absolute -top-3 -left-5 w-6" />
        <Sparkle className="absolute -right-4 -bottom-2 w-4" style={{ animationDelay: "0.9s" }} />
      </div>
      <div>
        <p className="text-lg font-extrabold text-foreground">Collecting your quiet notes…</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Mumbles land here as soon as they&apos;re in.</p>
      </div>
    </div>
  );
}
