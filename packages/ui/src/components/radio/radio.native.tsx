import { tv } from "@mona-ca/tailwind-helpers";
import { type ElementRef, type Ref, forwardRef, useState } from "react";
import { Pressable, type PressableProps } from "react-native";

type Props = Omit<PressableProps, "children" | "disabled"> & {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
};

const styleVariants = tv({
	base: "size-6 rounded-full transition-all",
	variants: {
		checked: {
			true: "border-[6px] border-blue-9 bg-slate-2",
			false: "border border-slate-7 bg-slate-2",
		},
		disabled: {
			true: "opacity-75",
		},
	},
	compoundVariants: [
		{
			disabled: true,
			checked: false,
			class: "border-slate-4 bg-slate-4",
		},
		{
			disabled: true,
			checked: true,
			class: "border-slate-9 bg-slate-2",
		},
	],
});

const Rdo = (
	{ checked = false, onChange = () => {}, disabled, ...props }: Props,
	ref: Ref<ElementRef<typeof Pressable>>,
) => {
	const [isChecked, setChecked] = useState<boolean>(checked);

	return (
		<Pressable
			ref={ref}
			disabled={disabled}
			className={styleVariants({ checked: isChecked, disabled })}
			onPress={() => {
				setChecked(!isChecked);
				onChange(!isChecked);
			}}
			{...props}
		/>
	);
};

const Radio = forwardRef<ElementRef<typeof Pressable>, Props>(Rdo);

Radio.displayName = "Radio";

export { Radio };
