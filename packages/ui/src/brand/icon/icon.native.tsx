import Icon from "@mona-ca/core/assets/brand/icon.svg";
import { twMerge } from "@mona-ca/tailwind-helpers";
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

const MonaCaIcon: FC<Props> = ({ className }) => {
	return <Icon className={twMerge("aspect-square", className)} />;
};

export { MonaCaIcon };
