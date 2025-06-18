import BlueViolet from "@mona-ca/core/assets/social/discord/blue-violet-icon.svg";
import White from "@mona-ca/core/assets/social/discord/white-icon.svg";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../../icons/type";

cssInterop(BlueViolet, {
	className: {
		target: "style",
	},
});

cssInterop(White, {
	className: {
		target: "style",
	},
});

const BlueVioletDiscordIcon: FC<IconProps> = props => {
	return <BlueViolet {...props} />;
};

const WhiteDiscordIcon: FC<IconProps> = props => {
	return <White {...props} />;
};

export { BlueVioletDiscordIcon, WhiteDiscordIcon };
