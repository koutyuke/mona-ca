import path from "node:path";
import radixColors from "@radix-ui/colors";
import type { ColorName, ColorProfile, Colors } from "./type";
import { RadixColor, exportJSON } from "./utils";

const exportRadixColors = ({
	colors = true,
	p3 = true,
	alpha = true,
	dark = true,
}: {
	colors?: ColorName[] | true;
	p3?: boolean;
	alpha?: boolean;
	dark?: boolean;
}) => {
	const exportColors: Colors = dark ? { light: {}, dark: {} } : { light: {} };

	const sameNameColors: Record<string, RadixColor[]> = {};
	const sameNameBlackOverlayColors: RadixColor[] = [];
	const sameNameWhiteOverlayColors: RadixColor[] = [];

	Object.entries(radixColors).forEach(([key, value]) => {
		const radixColor = new RadixColor(key, value);

		if (radixColor.name === "white") {
			sameNameWhiteOverlayColors.push(radixColor);
			return;
		}

		if (radixColor.name === "black") {
			sameNameBlackOverlayColors.push(radixColor);
			return;
		}

		if (colors !== true && !colors.includes(radixColor.name as Exclude<ColorName, "black" | "white">)) {
			return;
		}

		if (sameNameColors[radixColor.name] === undefined) {
			sameNameColors[radixColor.name] = [radixColor];
		} else {
			sameNameColors[radixColor.name]!.push(radixColor);
		}
	});

	Object.entries(sameNameColors).forEach(([key, value]) => {
		const lightColor = value.find(color => !color.isDark && !color.isP3 && !color.isAlpha);
		const lightColorAlpha = value.find(color => !color.isDark && !color.isP3 && color.isAlpha);
		const lightColorP3 = value.find(color => !color.isDark && color.isP3 && !color.isAlpha);
		const lightColorP3Alpha = value.find(color => !color.isDark && color.isP3 && color.isAlpha);

		const darkColor = value.find(color => color.isDark && !color.isP3 && !color.isAlpha);
		const darkColorAlpha = value.find(color => color.isDark && !color.isP3 && color.isAlpha);
		const darkColorP3 = value.find(color => color.isDark && color.isP3 && !color.isAlpha);
		const darkColorP3Alpha = value.find(color => color.isDark && color.isP3 && color.isAlpha);

		if (
			lightColor === undefined ||
			lightColorAlpha === undefined ||
			lightColorP3 === undefined ||
			lightColorP3Alpha === undefined ||
			darkColor === undefined ||
			darkColorAlpha === undefined ||
			darkColorP3 === undefined ||
			darkColorP3Alpha === undefined
		) {
			throw new Error(`Invalid color data: ${key}`);
		}

		const lightColorProfile: ColorProfile = {
			...lightColor.data,
		};

		const darkColorProfile: ColorProfile = {
			...darkColor.data,
		};

		if (alpha) {
			lightColorProfile.a = lightColorAlpha.data;
			darkColorProfile.a = darkColorAlpha.data;
		}

		if (p3) {
			lightColorProfile.p3 = {
				...lightColorP3.data,
			};
			darkColorProfile.p3 = {
				...darkColorP3.data,
			};
		}

		if (alpha && p3) {
			lightColorProfile.p3!.a = lightColorP3Alpha.data;
			darkColorProfile.p3!.a = darkColorP3Alpha.data;
		}

		exportColors.light[key as Exclude<ColorName, "black" | "white">] = lightColorProfile;

		if (dark) {
			exportColors.dark![key as Exclude<ColorName, "black" | "white">] = darkColorProfile;
		}
	});

	if (colors === true || colors.includes("black")) {
		const blackOverlayColors = sameNameBlackOverlayColors.find(color => !color.isP3);
		const blackOverlayColorsP3 = sameNameBlackOverlayColors.find(color => color.isP3);

		if (blackOverlayColors === undefined || blackOverlayColorsP3 === undefined) {
			throw new Error("Invalid color data: black");
		}

		const blackOverlayColorProfile: ColorProfile = {
			DEFAULT: "rgba(0, 0, 0, 1)",
			...blackOverlayColors.data,
		};

		if (p3) {
			blackOverlayColorProfile.p3 = {
				DEFAULT: "color(display-p3 0 0 0 / 1)",
				...blackOverlayColorsP3.data,
			};
		}

		exportColors.black = blackOverlayColorProfile;
	}

	if (colors === true || colors.includes("white")) {
		const whiteOverlayColors = sameNameWhiteOverlayColors.find(color => !color.isP3);
		const whiteOverlayColorsP3 = sameNameWhiteOverlayColors.find(color => color.isP3);

		if (whiteOverlayColors === undefined || whiteOverlayColorsP3 === undefined) {
			throw new Error("Invalid color data: white");
		}

		const whiteOverlayColorProfile: ColorProfile = {
			DEFAULT: "rgba(255, 255, 255, 1)",
			...whiteOverlayColors.data,
		};

		if (p3) {
			whiteOverlayColorProfile.p3 = {
				DEFAULT: "color(display-p3 1 1 1 / 1)",
				...whiteOverlayColorsP3.data,
			};
		}

		exportColors.white = whiteOverlayColorProfile;
	}

	exportJSON(exportColors, `${path.resolve(__dirname, "..")}/radix-colors.json`);
};

export { exportRadixColors };
