import Icon from "@mona-ca/core/assets/social/google/icon.svg";
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

const GoogleIcon: FC<Props> = ({ className }) => {
	return <Icon className={twMerge("aspect-square", className)} />;
};

export { GoogleIcon };
