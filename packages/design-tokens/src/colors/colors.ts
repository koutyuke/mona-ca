import customColors from "./json/custom-colors.json";
import radixColors from "./json/radix-colors.json";

const { light: customColorsLight, dark: customColorsDark, ...customColorsOther } = customColors;
const { light: radixColorsLight, dark: radixColorsDark, ...radixColorsOther } = radixColors;

const colors = {
	transparent: "transparent",
	current: "currentColor",
	...radixColorsOther,
	...customColorsOther,
	light: {
		...radixColorsLight,
		...customColorsLight,
	},
	dark: {
		...radixColorsDark,
		...customColorsDark,
	},
};

export { colors };
