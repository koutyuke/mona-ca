import type { Config } from "tailwindcss";

const baseConfig: Config = {
	mode: "jit",
	content: ["./src/**/*.{tsx,ts}"],
	theme: {
		screens: {
			tablet: "640px",
			laptop: "1024px",
			desktop: "1280px",
		},
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
			},
		},
	},
	plugins: [],
};

export { baseConfig };
