import { twm } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import WaveSvg from "./wave.svg";

import type { FC } from "react";

type Props = {
	className?: string;
};

cssInterop(WaveSvg, {
	className: {
		target: "style",
		nativeStyleToProp: { width: true, height: true, stroke: true, fill: true, color: "fill" },
	},
});

const Wave: FC<Props> = ({ className }) => {
	return <WaveSvg className={twm("aspect-[200_/_17]", className)} />;
};

export { Wave };
