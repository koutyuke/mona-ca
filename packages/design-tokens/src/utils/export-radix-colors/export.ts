import path from "node:path";
import radixColors from "@radix-ui/colors";
import type { ColorName, ColorProfile, Colors } from "./type";
import { RadixColor, exportJSON } from "./utils";

const main = ({
	useColors = undefined,
	withP3 = true,
	withAlpha = true,
	withDark = true,
}: {
	useColors?: (Exclude<ColorName, "black" | "white"> | "pure")[];
	withP3?: boolean;
	withAlpha?: boolean;
	withDark?: boolean;
}) => {
	const colors: Colors = withDark ? { light: {}, dark: {} } : { light: {} };

	const sameNameColors: Record<string, RadixColor[]> = {};
	const pureColors: RadixColor[] = [];

	Object.entries(radixColors).forEach(([key, value]) => {
		const radixColor = new RadixColor(key, value);

		if (radixColor.name === "white" || radixColor.name === "black") {
			pureColors.push(radixColor);
			return;
		}

		if (useColors !== undefined && !useColors.includes(radixColor.name as Exclude<ColorName, "black" | "white">)) {
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

		if (withAlpha) {
			lightColorProfile.a = lightColorAlpha.data;
			darkColorProfile.a = darkColorAlpha.data;
		}

		if (withP3) {
			lightColorProfile.p3 = {
				...lightColorP3.data,
			};
			darkColorProfile.p3 = {
				...darkColorP3.data,
			};
		}

		if (withAlpha && withP3) {
			lightColorProfile.p3!.a = lightColorP3Alpha.data;
			darkColorProfile.p3!.a = darkColorP3Alpha.data;
		}

		colors.light[key as Exclude<ColorName, "black" | "white">] = lightColorProfile;

		if (withDark) {
			colors.dark![key as Exclude<ColorName, "black" | "white">] = darkColorProfile;
		}
	});

	if (useColors === undefined || useColors.includes("pure")) {
		const lightPureColor = pureColors.find(color => color.name === "black" && !color.isP3);
		const lightPureColorP3 = pureColors.find(color => color.name === "black" && color.isP3);
		const darkPureColor = pureColors.find(color => color.name === "white" && !color.isP3);
		const darkPureColorP3 = pureColors.find(color => color.name === "white" && color.isP3);

		if (
			lightPureColor === undefined ||
			lightPureColorP3 === undefined ||
			darkPureColor === undefined ||
			darkPureColorP3 === undefined
		) {
			throw new Error("Invalid color data: pure");
		}

		const lightPureColorProfile: ColorProfile = {
			DEFAULT: "rgba(0, 0, 0, 1)",
			...lightPureColor.data,
		};

		const darkPureColorProfile: ColorProfile = {
			DEFAULT: "rgba(255, 255, 255, 1)",
			...darkPureColor.data,
		};

		if (withP3) {
			lightPureColorProfile.p3 = {
				DEFAULT: "color(display-p3 0 0 0 / 1",
				...lightPureColorP3.data,
			};
			darkPureColorProfile.p3 = {
				DEFAULT: "color(display-p3 1 1 1 / 1",
				...darkPureColorP3.data,
			};
		}

		colors.light.pure = lightPureColorProfile;
		if (withDark) {
			colors.dark!.pure = darkPureColorProfile;
		}
	}

	exportJSON(colors, `${path.resolve(__dirname, "../..")}/radix-colors.json`);
};

main({ withP3: false, withAlpha: false });
