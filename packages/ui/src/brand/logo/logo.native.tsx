import { twMerge } from "@mona-ca/tailwind-helpers";
import Logo from "@ui/assets/brand/logo.svg";
import { cssInterop } from "nativewind";
import type { FC } from "react";

type Props = {
	className?: string;
};

cssInterop(Logo, {
	className: {
		target: "style",
	},
});

const BrandLogo: FC<Props> = ({ className }) => {
	return <Logo className={twMerge("aspect-[4_/_1] h-full", className)} />;
};

export { BrandLogo };
