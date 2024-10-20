import path from "node:path";
import * as babel from "@babel/core";
import type { TransformerFn } from "tailwindcss/types/config";
import { fileWrite } from "../scripts/utils/file-write";

let num = 0;

const transformBabel = (ext: string, content: string) => {
	if (!content) {
		return content;
	}
	const config: babel.TransformOptions = {
		filename: `tailwind-helpers.${ext}`,
		plugins: ["@mona-ca/tailwind-helpers/babel-plugin"],
		presets: ["@babel/preset-typescript", "@babel/preset-react"],
		babelrc: false,
		configFile: false,
	};

	try {
		const res = babel.transformSync(content, config);

		if (!res?.code) {
			throw new Error("Failed to transform file");
		}

		return res.code;
	} catch (error) {
		fileWrite(`${path.resolve(__dirname, `./log/${num}.txt`)}`, JSON.stringify({ error, content }, null, 2));
		num++;
		return content;
	}
};

const twHelperTransforms: Record<string, TransformerFn> = {
	tsx: content => transformBabel("tsx", content),
	ts: content => transformBabel("ts", content),
	jsx: content => transformBabel("jsx", content),
	js: content => transformBabel("js", content),
};

export { twHelperTransforms };
