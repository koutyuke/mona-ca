import type { baseConfig } from "@mona-ca/tailwind-config";
import type resolveConfig from "tailwindcss/resolveConfig";

type ResolveConfigTheme = ReturnType<typeof resolveConfig<typeof baseConfig>>["theme"];

type Color = keyof ResolveConfigTheme["colors"];

type C = ResolveConfigTheme["colors"];

type PureColor = {
	[K in keyof C]: C[K] extends string ? K : never;
}[keyof C];

type ScaleColor = Exclude<Color, PureColor | "black" | "white">;

export type { Color, ScaleColor, PureColor, ResolveConfigTheme };
