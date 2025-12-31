import DarkIcon from "@mona-ca/core/assets/brand/dark-icon.svg";
import LightIcon from "@mona-ca/core/assets/brand/light-icon.svg";
import Logo from "@mona-ca/core/assets/brand/logo.svg";
import { twMerge } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";

import type { FC } from "react";
import type { IconProps } from "../icons/type";

const brandSvgList = [DarkIcon, LightIcon, Logo] as const;

for (const Svg of brandSvgList) {
	cssInterop(Svg, {
		className: {
			target: "style",
		},
	});
}

// === Mona Ca Icon ===
export const MonaCaLightIcon: FC<IconProps> = ({ className, ...props }) => {
	return <LightIcon className={twMerge("aspect-square", className)} {...props} />;
};

export const MonaCaDarkIcon: FC<IconProps> = ({ className, ...props }) => {
	return <DarkIcon className={twMerge("aspect-square", className)} {...props} />;
};

// === Mona Ca Logo ===
export const MonaCaLogo: FC<IconProps> = ({ className, ...props }) => {
	return <Logo className={twMerge("aspect-[4_/_1]", className)} {...props} />;
};
