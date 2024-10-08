// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { withNativeWind } = require("nativewind/metro");

config.transformer.unstable_allowRequireContext = true;

config.resolver.sourceExts.push("mjs");

const { transformer, resolver } = config;

config.transformer = {
	...transformer,
	babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
	...resolver,
	assetExts: resolver.assetExts.filter(ext => ext !== "svg"),
	sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, {
	input: "./src/app/global.css",
	configPath: "./tailwind.config.ts",
	inlineRem: 16,
});
