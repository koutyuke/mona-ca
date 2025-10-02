import { breakpoints } from "@mona-ca/design-tokens";
import { colors as colorTokens } from "@mona-ca/design-tokens";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { createConfigColors, createThemeColorVariables } from "./utils/color";
import { fontFamily, fontVariables } from "./utils/font";

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
			fontFamily,
		},
	},
	plugins: [
		// Color Theme
		plugin(({ addBase, addUtilities }) => {
			addBase({ ":root": themeColorVariables.light });
			addUtilities({
				".light, [data-theme='light']": themeColorVariables.light,
				".dark, [data-theme='dark']": themeColorVariables.dark,
				".ios, [data-platform='ios']": fontVariables.ios,
				".android, [data-platform='android']": fontVariables.android,
			});
		}),
	],
} satisfies Config;

export { baseConfig, themeColorVariables };
