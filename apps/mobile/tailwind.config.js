const { baseConfig } = require("@mona-ca/tailwindcss");
const nativewindConfig = require("nativewind/preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/app/**/*.{js,jsx,ts,tsx}"],
	presets: [nativewindConfig, baseConfig],
};
