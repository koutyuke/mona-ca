type NestedRecord = {
	[key: string]: string | NestedRecord;
};

const createConfigColors = ({
	colorTokens,
	variable = "--color",
}: { colorTokens: NestedRecord; variable?: string }): NestedRecord => {
	return Object.fromEntries(
		Object.entries(colorTokens).map(([key, value]) => {
			if (typeof value === "object") {
				return [key, createConfigColors({ colorTokens: value, variable: `${variable}-${key}` })];
			}
			return [key, `var(${variable}-${key})`];
		}),
	) as NestedRecord;
};

const createThemeColorVariables = <T extends Record<string, NestedRecord>>(
	themeColorTokens: T,
	variable = "--color",
): {
	[key in keyof T]: Record<string, string>;
} => {
	return Object.fromEntries(
		Object.entries(themeColorTokens).map(([key, value]) => {
			const colorVariables: Record<string, string> = {};

			const func = (tokens: NestedRecord, prefix = variable) => {
				Object.entries(tokens).forEach(([key, value]) => {
					if (typeof value === "object") {
						func(value, `${prefix}-${key}`);
					} else {
						colorVariables[`${prefix}-${key}`] = value;
					}
				});
			};

			func(value);

			return [key, colorVariables];
		}),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	) as any;
};

export { createConfigColors, createThemeColorVariables };
