import fs from "node:fs";
import type { ColorName, TonePallet } from "./type";

class RadixColor {
	name: ColorName;
	data: TonePallet;
	isDark: boolean;
	isAlpha: boolean;
	isP3: boolean;
	isP3Alpha: boolean;

	constructor(colorName: string, colorData: Record<string, string>) {
		const splitName = this.splitCamelCase(colorName);

		if (splitName.length === 0) {
			throw new Error(`Invalid color name: ${colorName}`);
		}

		this.name = splitName[0] as ColorName;

		this.data = Object.fromEntries(
			Object.entries(colorData).map(([key, value]) => {
				const tone = this.getTone(key);
				return [tone, value];
			}),
		) as TonePallet;

		this.isDark = splitName.includes("Dark");
		this.isAlpha = splitName.includes("A");
		this.isP3 = splitName.includes("P3");
		this.isP3Alpha = this.isP3 && this.isAlpha;
	}

	private splitCamelCase = (input: string): string[] =>
		input
			.replace(/([A-Z])/g, " $1")
			.trim()
			.split(/\s+/);

	private getTone = (str: string): number => {
		const match = str.match(/([a-zA-Z]+)(\d+)$/);
		if (!match || match.length !== 3) {
			throw new Error(`Invalid color name: ${str}`);
		}
		const tone = Number.parseInt(match[2] ?? "", 10);
		if (Number.isNaN(tone) || tone < 1 || tone > 12) {
			throw new Error(`Invalid tone number: ${tone}`);
		}

		return tone;
	};
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const exportJSON = (data: any, filename: string): void => {
	const jsonStr = JSON.stringify(data, null, 2);
	fs.writeFile(filename, jsonStr, err => {
		if (err) throw err;
	});
};

export { exportJSON, RadixColor };
