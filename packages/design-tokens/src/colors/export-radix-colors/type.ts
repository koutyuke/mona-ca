import type colors from "@radix-ui/colors";

type TonePallet = {
	DEFAULT?: string;
	1: string;
	2: string;
	3: string;
	4: string;
	5: string;
	6: string;
	7: string;
	8: string;
	9: string;
	10: string;
	11: string;
	12: string;
};

type ColorProfile = TonePallet & {
	a?: TonePallet;
	p3?: TonePallet & {
		a?: TonePallet;
	};
};

type ColorTheme = {
	light: ColorProfile;
	dark: ColorProfile;
};

type ExtractColor<T extends string> = T extends `${infer Color}${"Dark" | "DarkA" | "DarkP3" | "DarkP3A"}`
	? Color
	: never;

type ColorName = ExtractColor<keyof typeof colors> | "white" | "black";

type Colors = {
	light: {
		[key in Exclude<ColorName, "black" | "white">]?: ColorProfile;
	};
	dark?: {
		[key in Exclude<ColorName, "black" | "white">]?: ColorProfile;
	};
	black?: ColorProfile;
	white?: ColorProfile;
};

export type { ColorProfile, ColorTheme, TonePallet, Colors, ColorName };
