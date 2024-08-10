import { twMerge } from "tailwind-merge";
import type { Color } from "../types/color.type";

/**
 * tailwindcss color palette
 *
 * tailwindcssで書かれたclassでcolorPaletteを指定された色に変換する関数
 *
 * @param { string } className
 * @param { Color } color
 * @returns { string }
 */
const twColorPalette = (className: string, color: Color): string => {
	return twMerge(className.replace(/-colorPalette-/g, `-${color}-`));
};

export { twColorPalette };
