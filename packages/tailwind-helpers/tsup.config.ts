import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/babel/plugin.ts"],
	outDir: "./dist",
});
