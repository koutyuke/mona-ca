import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import type { StorybookConfig } from "@storybook/react-native";

const require = createRequire(import.meta.url);

const main: StorybookConfig = {
	stories: [
		{
			directory: "../../mobile/src",
			files: "**/*.story.@(ts|tsx)",
			titlePrefix: "app - mobile",
		},
		{
			directory: "../../../packages/ui/src",
			files: "**/*.native.story.@(ts|tsx)",
			titlePrefix: "package - ui",
		},
	],
	addons: [getAbsolutePath("@storybook/addon-ondevice-controls"), getAbsolutePath("@storybook/addon-ondevice-actions")],
};

export default main;

function getAbsolutePath(value: string) {
	return dirname(require.resolve(join(value, "package.json")));
}
