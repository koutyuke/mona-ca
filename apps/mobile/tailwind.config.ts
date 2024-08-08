import { baseConfig } from "@mona-ca/tailwind-config";
import type { Config } from "tailwindcss";

const nativewindConfig = require("nativewind/preset");

const config = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [nativewindConfig, baseConfig],
} satisfies Config;

export default config;
