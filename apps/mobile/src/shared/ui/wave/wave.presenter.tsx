import { twMerge } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import WaveSvg from "./wave.svg";

type Props = {
	className?: string;
};

cssInterop(WaveSvg, {
	className: {
		target: "style",
	},
});

const Wave: FC<Props> = ({ className }) => {
	return <WaveSvg className={twMerge("aspect-[200_/_17] ", className)} />;
};

export { Wave };
