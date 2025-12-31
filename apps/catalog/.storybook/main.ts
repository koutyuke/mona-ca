import { createRequire } from "node:module";
import path, { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-webpack5";

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
	stories: [
		{
			directory: "../../../web/src",
			files: "**/*.story.@(ts|tsx)",
			titlePrefix: "app - web",
		},
		{
			directory: "../../../../packages/ui/src",
			files: "**/!(*.native).story.@(ts|tsx)",
			titlePrefix: "package - ui",
		},
	],

	addons: [
		getAbsolutePath("@storybook/addon-onboarding"),
		getAbsolutePath("@storybook/addon-links"),
		getAbsolutePath("@chromatic-com/storybook"),
		getAbsolutePath("@storybook/addon-a11y"),
		getAbsolutePath("@storybook/addon-themes"),
		getAbsolutePath("@storybook/addon-webpack5-compiler-swc"),
		{
			name: getAbsolutePath("@storybook/addon-styling-webpack"),
			options: {
				rules: [
					// Replaces existing CSS rules to support PostCSS
					{
						test: /\.css$/,
						use: [
							"style-loader",
							{
								loader: "css-loader",
								options: { importLoaders: 1 },
							},
							{
								// Gets options from `postcss.config.js` in your project root
								loader: "postcss-loader",
								options: {
									implementation: require.resolve("postcss"),
								},
							},
						],
					},
				],
			},
		},
		{
			name: getAbsolutePath("@storybook/addon-react-native-web"),
			options: {
				modulesToTranspile: ["react-native-reanimated", "nativewind", "react-native-css-interop"],
				// babelPresets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
				// babelPlugins: [
				// 	"react-native-reanimated/plugin",
				// 	[
				// 		"@babel/plugin-transform-react-jsx",
				// 		{
				// 			runtime: "automatic",
				// 			importSource: "nativewind",
				// 		},
				// 	],
				// ],
			},
		},
		getAbsolutePath("@storybook/addon-docs"),
	],

	framework: {
		name: getAbsolutePath("@storybook/react-webpack5"),
		options: {
			builder: {
				useSWC: true,
			},
		},
	},

	webpackFinal: webpackConfig => {
		if (webpackConfig.resolve) {
			webpackConfig.resolve.alias = {
				...webpackConfig.resolve.alias,
				"@mobile": path.resolve(__dirname, "../../../mobile/src"),
				"@mobile/public": path.resolve(__dirname, "../../../mobile/public"),
				"@web": path.resolve(__dirname, "../../../web/src"),
				"@web/public": path.resolve(__dirname, "../../../web/public"),
				"@ui": path.resolve(__dirname, "../../../../packages/ui/src"),
			};
		}

		webpackConfig.module?.rules?.push({
			test: /\.(js|jsx|ts|tsx)$/,
			loader: "babel-loader",
			options: {
				presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
				plugins: ["react-native-reanimated/plugin"],
			},
		});

		return webpackConfig;
	},

	swc: () => ({
		jsc: {
			transform: {
				react: {
					runtime: "automatic",
				},
			},
		},
	}),
};

export default config;

function getAbsolutePath(value: string) {
	return dirname(require.resolve(join(value, "package.json")));
}
