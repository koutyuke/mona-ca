import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/babel/plugin.ts"],
	outDir: "./dist",
	external: ["@babel/core", "@babel/generator"],
	dts: true,
});
