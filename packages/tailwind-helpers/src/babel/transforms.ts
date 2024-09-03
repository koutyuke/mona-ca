import * as babel from "@babel/core";
import type { TransformerFn } from "tailwindcss/types/config";

const transformBabel = (ext: string, content: string) => {
	const config: babel.TransformOptions = {
		filename: `tailwind-helpers.${ext}`,
		plugins: [
			["@babel/plugin-transform-class-properties", { loose: true }],
			["@babel/plugin-transform-private-property-in-object", { loose: true }],
			["@babel/plugin-transform-private-methods", { loose: true }],
			"@mona-ca/tailwind-helpers/babel-plugin",
		],
		presets: [
			"@babel/preset-env",
			"@babel/preset-react",
			["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
		],
	};

	const res = babel.transformSync(content, config);

	if (!res?.code) {
		throw new Error("Failed to transform file");
	}

	return res.code;
};

const twHelperTransforms: Record<string, TransformerFn> = {
	tsx: content => transformBabel("tsx", content),
	ts: content => transformBabel("ts", content),
	jsx: content => transformBabel("jsx", content),
	js: content => transformBabel("js", content),
};

export { twHelperTransforms };
