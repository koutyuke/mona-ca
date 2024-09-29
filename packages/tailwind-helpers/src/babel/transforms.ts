import * as babel from "@babel/core";
import type { TransformerFn } from "tailwindcss/types/config";

const transformBabel = (ext: string, content: string) => {
	const config: babel.TransformOptions = {
		filename: `tailwind-helpers.${ext}`,
		plugins: ["@mona-ca/tailwind-helpers/babel-plugin"],
	};

	try {
		const res = babel.transformSync(content, config);
		if (!res?.code) {
			throw new Error("Failed to transform file");
		}

		return res.code;
	} catch (error) {
		console.error(error);
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
