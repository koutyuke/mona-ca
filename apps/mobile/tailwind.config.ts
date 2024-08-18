import { baseConfig } from "@mona-ca/tailwind-config";
import { twHelperTransforms } from "@mona-ca/tailwind-helpers/transforms";
import type { Config } from "tailwindcss";

const nativewindConfig = require("nativewind/preset");

const config = {
	content: {
		files: ["./src/**/*.{js,jsx,ts,tsx}"],
		transform: twHelperTransforms,
	},
	presets: [nativewindConfig, baseConfig],
	corePlugin: {
		textOpacity: true,
		backgroundOpacity: true,
	},
} satisfies Config;

export default config;
