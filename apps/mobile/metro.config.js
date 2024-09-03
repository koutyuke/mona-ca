// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

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

module.exports = withNativeWind(config, {
	input: "./src/styles/global.css",
	configPath: "tailwind.config.ts",
	inlineRem: 16,
});
