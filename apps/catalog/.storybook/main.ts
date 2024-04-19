import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
	stories: [
		{
			directory: "../../web/src",
			files: "**/*.story.@(ts|tsx)",
			titlePrefix: "app - web",
		},
		{
			directory: "../../mobile/src",
			files: "**/*.story.@(ts|tsx)",
			titlePrefix: "app -mobile",
		},
		{
			directory: "../../../packages/ui",
			files: "**/*.story.@(ts|tsx)",
			titlePrefix: "package - ui",
		},
	],
	addons: [
		"@storybook/addon-webpack5-compiler-swc",
		"@storybook/addon-onboarding",
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@chromatic-com/storybook",
		"@storybook/addon-interactions",
		"@storybook/addon-a11y",
		"storybook-dark-mode",
		"@storybook/addon-storysource",
	],
	framework: {
		name: "@storybook/react-webpack5",
		options: {},
	},
	webpackFinal: webpackConfig => {
		const customConfig: typeof webpackConfig = {
			...webpackConfig,
			resolve: {
				...webpackConfig.resolve,
				alias: {
					...webpackConfig.resolve?.alias,
					"react-native$": "react-native-web",
				},
			},
		};
		return customConfig;
	},
	docs: {
		autodocs: "tag",
	},
};

export default config;
