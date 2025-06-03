import { breakpoints } from "@mona-ca/design-tokens";
import { colors as colorTokens } from "@mona-ca/design-tokens";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { createConfigColors, createThemeColorVariables } from "./utils/color";

const { light, dark, ...particular } = colorTokens;

const themeColorVariables = createThemeColorVariables({ light, dark });
const configColors = createConfigColors({
	...light,
	...dark,
});

const baseConfig = {
	content: ["./src/**/*.{tsx,ts}"],
	theme: {
		screens: breakpoints,
		colors: {
			...particular,
			...configColors,
		},
		extend: {
			fontFamily: {
				"kiwi-maru-light": ["KiwiMaru_300Light", "sans-serif"],
				"kiwi-maru-regular": ["KiwiMaru_400Regular", "sans-serif"],
				"kiwi-maru-medium": ["KiwiMaru_500Medium", "sans-serif"],
			},
		},
	},
	plugins: [
		// Color Theme
		plugin(({ addBase, addUtilities }) => {
			addBase({ ":root": themeColorVariables.light });
			addUtilities({
				".light, [data-theme='light']": themeColorVariables.light,
				".dark, [data-theme='dark']": themeColorVariables.dark,
			});
		}),
	],
} satisfies Config;

export { baseConfig, themeColorVariables };
