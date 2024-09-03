import Logo from "@mona-ca/core/assets/brand/logo.svg";
import { twMerge } from "@mona-ca/tailwind-helpers";
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

const MonaCaLogo: FC<Props> = ({ className }) => {
	return <Logo className={twMerge("aspect-[4_/_1]", className)} />;
};

export { MonaCaLogo };
