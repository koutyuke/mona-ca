import BlueIcon from "@mona-ca/core/assets/social/discord/blue-icon.svg";
import WhiteIcon from "@mona-ca/core/assets/social/discord/white-icon.svg";
import { twMerge } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import type { FC } from "react";

type Props = {
	className?: string;
	color?: "blue" | "white";
};

cssInterop(BlueIcon, {
	className: {
		target: "style",
	},
});

cssInterop(WhiteIcon, {
	className: {
		target: "style",
	},
});

const DiscordIcon: FC<Props> = ({ className, color = "blue" }) => {
	const Icon = color === "blue" ? BlueIcon : WhiteIcon;
	return <Icon className={twMerge("aspect-square", className)} />;
};

export { DiscordIcon };
