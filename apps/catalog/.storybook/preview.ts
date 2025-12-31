import { withThemeByClassName, withThemeByDataAttribute } from "@storybook/addon-themes";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import "./global.css";

import type { Preview } from "@storybook/react";

const DEFAULT_THEME = "light";
const BACKGROUND_CSS_VALUE = "var(--color-slate-1)";
const ATTRIBUTE_NAME = "data-theme";
const THEMES = {
	light: "light",
	dark: "dark",
};

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		viewport: {
			options: INITIAL_VIEWPORTS,
		},
		backgrounds: {
			options: {
				auto_change: {
					name: "Auto Change",
					value: BACKGROUND_CSS_VALUE,
				},
			},
		},
	},

	decorators: [
		withThemeByClassName({
			themes: THEMES,
			defaultTheme: DEFAULT_THEME,
		}),
		withThemeByDataAttribute({
			themes: THEMES,
			defaultTheme: DEFAULT_THEME,
			attributeName: ATTRIBUTE_NAME,
		}),
	],

	tags: ["autodocs"],

	initialGlobals: {
		backgrounds: {
			value: "auto_change",
		},
	},
};

export default preview;
