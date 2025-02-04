import { baseConfig } from "@mona-ca/tailwind-config";
import type { Config } from "tailwindcss";

const config = {
	content: {
		files: ["./src/**/*.{js,jsx,ts,tsx}"],
	},
	presets: [baseConfig],
} satisfies Config;

export default config;
