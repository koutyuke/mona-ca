import { withThemeByClassName, withThemeByDataAttribute } from "@storybook/addon-themes";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import type { Preview } from "@storybook/react";
import "./style.css";

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
			viewports: INITIAL_VIEWPORTS,
		},
		backgrounds: {
			default: "Auto Change",
			values: [
				{
					name: "Auto Change",
					value: BACKGROUND_CSS_VALUE,
				},
			],
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
};

export default preview;
