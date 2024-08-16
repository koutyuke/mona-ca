// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { withNativeWind } = require("nativewind/metro");

config.transformer.unstable_allowRequireContext = true;

config.resolver.sourceExts.push("mjs");

module.exports = withNativeWind(config, { input: "./src/app/global.css", configPath: "./tailwind.config.ts" });
