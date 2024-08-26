import { twMerge } from "@mona-ca/tailwind-helpers";
import Icon from "@ui/assets/brand/icon.svg";
import { cssInterop } from "nativewind";
import type { FC } from "react";

type Props = {
	className?: string;
};

cssInterop(Icon, {
	className: {
		target: "style",
	},
});

const BrandIcon: FC<Props> = ({ className }) => {
	return <Icon className={twMerge("aspect-square h-full", className)} />;
};

export { BrandIcon };
