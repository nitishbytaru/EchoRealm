import { MessageSquare, Megaphone, MessageCircle, type LucideIcon } from "lucide-react";

export type SectionKey = "links" | "shout" | "mumble";

export interface Section {
  key: SectionKey;
  href: string;
  /** Path prefix that marks this section as active. */
  match: string;
  label: string;
  icon: LucideIcon;
  /** Tailwind background class for the section's brand color. */
  fill: string;
}

/** The three spaces, each with its color from the logo. */
export const SECTIONS: Section[] = [
  { key: "links", href: "/links", match: "/links", label: "EchoLink", icon: MessageSquare, fill: "bg-primary" },
  { key: "shout", href: "/shout", match: "/shout", label: "EchoShout", icon: Megaphone, fill: "bg-secondary" },
  { key: "mumble", href: "/mumbles/read", match: "/mumbles", label: "EchoMumble", icon: MessageCircle, fill: "bg-nb-accent" },
];

export const sectionFor = (pathname: string) => SECTIONS.find((s) => pathname.startsWith(s.match));
