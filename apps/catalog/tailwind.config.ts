import { baseConfig } from "@mona-ca/tailwind-config";
import { twHelperTransforms } from "@mona-ca/tailwind-helpers/transforms";
import type { Config } from "tailwindcss";

const nativewindConfig = require("nativewind/preset");

const config = {
	content: {
		files: [
			"./**/*.{js,jsx,ts,tsx}",
			"./.storybook/**/*.{ts,tsx}",
			"../web/**/*.{js,jsx,ts,tsx}",
			"../mobile/**/*.{js,jsx,ts,tsx}",
			"../../packages/ui/**/*.{js,jsx,ts,tsx}",
		],
		transform: twHelperTransforms,
	},
	presets: [nativewindConfig, baseConfig],
} satisfies Config;

export default config;
