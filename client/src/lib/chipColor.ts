const CHIP_COLORS = ["bg-secondary", "bg-nb-accent", "bg-nb-success", "bg-nb-warning", "bg-destructive"];

/** A stable brand color for a person, picked from their name. */
export const chipColor = (name?: string) =>
  CHIP_COLORS[[...(name || "?")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % CHIP_COLORS.length];
