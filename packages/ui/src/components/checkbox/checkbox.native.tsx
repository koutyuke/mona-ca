import { tv } from "@mona-ca/tailwind-helpers";
import { type FC, useState } from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import { CheckIcon } from "../../icons/index.native";
import { Text } from "../text/index.native";

type CheckBoxProps = {
	size?: "sm" | "md";
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	label?: string;
	labelPosition?: "left" | "right";
	labelColorClassName?: string;
};

const styleVariants = tv({
	slots: {
		body: "flex flex-row items-center gap-2 self-start",
		checkbox: "flex items-center justify-center border-[1.5px] transition",
		checkIcon: "transition",
	},
	variants: {
		size: {
			sm: {
				checkbox: "size-5",
				checkIcon: "size-4",
			},
			md: {
				checkbox: "size-6 rounded-md",
				checkIcon: "size-5",
				label: "",
			},
		},
		isChecked: {
			true: {
				checkbox: "border-blue-8 bg-blue-8",
				checkIcon: "opacity-100",
			},
			false: {
				checkbox: "border-slate-7 bg-slate-3",
				checkIcon: "opacity-0",
			},
		},
		disabled: {
			checked: {
				checkbox: "border-slate-8 bg-slate-8",
			},
			unchecked: {
				checkbox: "border-slate-5 bg-slate-5",
			},
			false: {},
		},
	},
});

const CheckBox: FC<CheckBoxProps> = ({
	size = "md",
	checked = false,
	className,
	onChange = () => {},
	disabled,
	label,
	labelPosition = "right",
	labelColorClassName = "",
}) => {
	const [isChecked, setChecked] = useState<boolean>(checked);

	const {
		body: bodyStyle,
		checkbox: checkboxStyle,
		checkIcon: checkIconStyle,
	} = styleVariants({ size, isChecked, disabled: disabled && (isChecked ? "checked" : "unchecked") });
	return (
		<TouchableWithoutFeedback
			onPress={() => {
				onChange(!isChecked);
				setChecked(!isChecked);
			}}
			disabled={disabled}
		>
			<View className={bodyStyle({ className })}>
				{labelPosition === "left" && (
					<Text size={size} className={labelColorClassName}>
						{label}
					</Text>
				)}
				<View className={checkboxStyle()}>
					<View className={checkIconStyle()}>
						<CheckIcon className="h-full w-full stroke-[3] stroke-white" />
					</View>
				</View>
				{labelPosition === "right" && (
					<Text size={size} className={`${disabled ? "text-slate-9" : labelColorClassName} transition`}>
						{label}
					</Text>
				)}
			</View>
		</TouchableWithoutFeedback>
	);
};

export { CheckBox };
