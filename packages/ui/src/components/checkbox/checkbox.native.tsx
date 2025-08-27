import { tv } from "@mona-ca/tailwind-helpers";
import { type FC, type ReactNode, type Ref, useState } from "react";
import { Pressable, type PressableProps, View } from "react-native";
import { CheckIcon } from "../../icons/index.native";

type Props = Omit<PressableProps, "children" | "disabled"> & {
	size?: "sm" | "md";
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	ref?: Ref<View>;
};

const styleVariants = tv({
	slots: {
		body: "flex items-center justify-center border border-slate-7 bg-slate-2 transition",
		icon: "opacity-0 transition",
	},
	variants: {
		size: {
			sm: {
				body: "size-5",
				icon: "size-4",
			},
			md: {
				body: "size-6 rounded-md",
				icon: "size-5",
			},
		},
		isChecked: {
			true: {
				body: "border-blue-9 bg-blue-9",
				icon: "opacity-100",
			},
		},
		disabled: {
			true: {
				body: "opacity-75",
			},
		},
	},
	compoundVariants: [
		{
			isChecked: true,
			disabled: true,
			class: {
				body: "border-slate-9 bg-slate-9",
			},
		},
		{
			isChecked: false,
			disabled: true,
			class: {
				body: "border-slate-4 bg-slate-4",
			},
		},
	],
});

const CheckBox: FC<Props> = ({
	size = "md",
	checked = false,
	className,
	onChange = () => {},
	disabled,
	ref,
	...props
}: Props): ReactNode => {
	const [isChecked, setChecked] = useState<boolean>(checked);

	const { body: bodyStyle, icon: iconStyle } = styleVariants({
		size,
		isChecked,
		disabled,
	});
	return (
		<Pressable
			{...props}
			className={bodyStyle({ className })}
			onPress={() => {
				onChange(!isChecked);
				setChecked(!isChecked);
			}}
			disabled={disabled}
			ref={ref}
		>
			<View className={iconStyle()}>
				<CheckIcon className="h-full w-full stroke-[3] stroke-white" />
			</View>
		</Pressable>
	);
};

CheckBox.displayName = "CheckBox";

export { CheckBox };
