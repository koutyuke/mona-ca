import { tv } from "@mona-ca/tailwind-helpers";
import { type FC, type Ref, useState } from "react";
import { Pressable, type PressableProps, View } from "react-native";

type Props = Omit<PressableProps, "children" | "disabled" | "onPress" | "className"> & {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	ref?: Ref<View>;
};

const styleVariants = tv({
	slots: {
		body: "h-8 w-[52px] rounded-full border p-0.5 transition-all",
		indicator: "aspect-square h-full rounded-full bg-white shadow-sm transition",
	},
	variants: {
		checked: {
			true: {
				body: "border-blue-9 bg-blue-9",
				indicator: "translate-x-5",
			},
			false: {
				body: "border-slate-6 bg-slate-3",
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
			disabled: true,
			checked: true,
			class: {
				body: "border-slate-9 bg-slate-9",
			},
		},
		{
			disabled: true,
			checked: false,
			class: {
				body: "border-slate-4 bg-slate-4",
				indicator: "shadow-none",
			},
		},
	],
});

const Switch: FC<Props> = ({ checked = false, onChange = () => {}, disabled, ref, ...props }) => {
	const [isChecked, setChecked] = useState(checked);
	const { body, indicator } = styleVariants({ checked: isChecked, disabled });
	return (
		<Pressable
			ref={ref}
			className={body()}
			disabled={disabled}
			onPress={() => {
				setChecked(!isChecked);
				onChange(!isChecked);
			}}
			{...props}
		>
			<View className={indicator()} />
		</Pressable>
	);
};

Switch.displayName = "Switch";

export { Switch };
