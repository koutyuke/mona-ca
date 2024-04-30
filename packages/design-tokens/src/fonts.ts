type Fonts = Record<
	string,
	{
		weight: `${number}`[];
		display: "auto" | "block" | "swap" | "fallback" | "optional";
		subsets?: Array<"latin" | "latin-ext">;
	}
>;

const fonts: Fonts = {};

export { fonts };
