import { Check } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { IconProps } from "../type";

type CheckIconProps = IconProps;

cssInterop(Check, {
	className: {
		target: "style",
	},
});

const CheckIcon = ({ size, ...otherProps }: CheckIconProps) => {
	return <Check size={size ?? 0} {...otherProps} />;
};

export { CheckIcon };
