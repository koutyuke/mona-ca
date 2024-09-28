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
	return <WaveSvg className={className ?? ""} />;
};

export { Wave };
