import { cssInterop } from "nativewind";
import type { FC } from "react";
import CustomizeSvg from "./customize.svg";
import MonaCaSvg from "./mona-ca.svg";
import ShareSvg from "./share.svg";

for (const SvgComponent of [CustomizeSvg, ShareSvg, MonaCaSvg]) {
	cssInterop(SvgComponent, {
		className: {
			target: "style",
		},
	});
}

type Props = {
	variant: "customize" | "share" | "mona-ca";
	className?: string;
};

const iconVariants = {
	customize: CustomizeSvg,
	share: ShareSvg,
	"mona-ca": MonaCaSvg,
};

export const FeatureCardIconUI: FC<Props> = ({ variant, className }) => {
	const IconComponent = iconVariants[variant];

	return <IconComponent className={className || ""} />;
};
