import chroma from "chroma-js";

type NestedRecord = {
	[key: string]: string | NestedRecord;
};

const createConfigColors = <T extends Record<string, NestedRecord | string>>(
	colorTokens: T,
): Record<keyof T, Record<string, string> | string> => {
	return Object.fromEntries(
		Object.entries(colorTokens).map(([key, value]) => {
			if (typeof value === "object") {
				return [key, flattenConfigColorTokens(value, `--color-${key}`)];
			}
			return [key, `rgb(var(--color-${key}) / <alpha-value>)`];
		}),
	);
};

const flattenConfigColorTokens = (colorTokens: NestedRecord, variable: string): Record<string, string> => {
	return Object.fromEntries(
		Object.entries(colorTokens).map(([key, value]) => {
			if (typeof value === "object") {
				return [key, flattenConfigColorTokens(value, `${variable}-${key}`)];
			}
			return [key, `rgb(var(${variable}-${key}) / <alpha-value>)`];
		}),
	);
};

const createThemeColorVariables = <T extends Record<string, NestedRecord>>(
	themeColorTokens: T,
): {
	[key in keyof T]: Record<string, string>;
} => {
	const colorVariableEntries = Object.entries(themeColorTokens).map(([key, value]) => {
		const colorVariables: Record<string, string> = {};

		const generateColorVariables = (tokens: NestedRecord, prefix = "--color"): void => {
			for (const [k, v] of Object.entries(tokens)) {
				if (typeof v === "object") {
					generateColorVariables(v, `${prefix}-${k}`);
				} else {
					const rgbValue = chroma(v).rgb().join(" ");
					colorVariables[`${prefix}-${k}`] = rgbValue;
				}
			}
		};

		generateColorVariables(value);

		return [key, colorVariables];
	});

	return Object.fromEntries(colorVariableEntries);
};

export { createConfigColors, createThemeColorVariables };
