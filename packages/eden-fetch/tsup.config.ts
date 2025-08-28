import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	splitting: false,
	clean: true,
	treeshake: true,
	minify: true,
	dts: {
		resolve: true,
		only: true,
	},
	format: ["esm"],
});
