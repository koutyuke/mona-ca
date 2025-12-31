// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");
const path = require("node:path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
	...transformer,
	babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
	...resolver,
	assetExts: resolver.assetExts.filter(ext => ext !== "svg"),
	sourceExts: [...resolver.sourceExts, "svg"],
	unstable_enablePackageExports: true,
	unstable_conditionNames: ["browser", "require", "react-native"],
};

const withNativeWindConfig = withNativeWind(config, {
	input: "./src/app/global.css",
	configPath: "./tailwind.config.ts",
	inlineRem: 16,
});

const withStorybookConfig = withStorybook(withNativeWindConfig, {
	enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true",
	configPath: path.resolve(__dirname, "./.rnstorybook"),
});

module.exports = withStorybookConfig;
