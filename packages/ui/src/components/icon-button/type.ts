import type { ScaleColor } from "@mona-ca/tailwind-helpers";

export type SupportColor = Extract<ScaleColor, "red" | "blue" | "green" | "yellow" | "salmon" | "gray"> | "white";

export type SupportSlot = "body" | "spinner" | "icon";

export type SupportSize = "sm" | "md" | "lg";

export type SupportVariant = "outline" | "light" | "filled" | "ghost";

export type SlotContract = Partial<Record<SupportSlot, string>>;
