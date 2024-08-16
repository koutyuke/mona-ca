import type { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
	stories: [
		{
			directory: "../../../mobile/src",
			files: "**/*.story.?(ts|tsx)",
			titlePrefix: "app - mobile",
		},
	],
	addons: ["@storybook/addon-ondevice-controls", "@storybook/addon-ondevice-actions"],
};

export default main;
