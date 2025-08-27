import { cn, tv } from "@mona-ca/tailwind-helpers";
import { type FC, useState } from "react";
import { Pressable, View } from "react-native";
import { CalendarHeartIcon, CalendarXIcon } from "../../icons/index.native";
import { Text } from "../text/index.native";

type Gender = "man" | "woman";

type GenderSelectorProps = {
	value?: Gender;
	onChange?: (gender: Gender) => void;
	className?: string;
};

const styleVariants = tv({
	slots: {
		pressable: "flex h-24 flex-1 items-center justify-center gap-2 rounded-2xl transition",
		icon: "size-8",
		text: "",
	},
	variants: {
		isSelected: {
			true: {
				pressable: "bg-salmon-9",
				icon: "stroke-white",
				text: "text-white",
			},
			false: {
				pressable: "bg-slate-3",
				icon: "stroke-slate-9",
				text: "text-slate-9",
			},
		},
	},
});

const GenderSelector: FC<GenderSelectorProps> = ({ value = "woman", onChange = () => {}, className }) => {
	const [gender, setGender] = useState<Gender>(value);

	const { pressable: pressableStyle, icon: iconStyle, text: textStyle } = styleVariants();

	return (
		<View className={cn("flex w-full flex-row gap-4", className)}>
			<Pressable
				className={pressableStyle({ isSelected: gender === "woman" })}
				onPress={() => {
					onChange("woman");
					setGender("woman");
				}}
			>
				<CalendarHeartIcon className={iconStyle({ isSelected: gender === "woman" })} />
				<Text size="sm" className={textStyle({ isSelected: gender === "woman" })}>
					生理がくる
				</Text>
			</Pressable>

			<Pressable
				className={pressableStyle({ isSelected: gender === "man" })}
				onPress={() => {
					onChange("man");
					setGender("man");
				}}
			>
				<CalendarXIcon className={iconStyle({ isSelected: gender === "man" })} />
				<Text size="sm" className={textStyle({ isSelected: gender === "man" })}>
					生理がこない
				</Text>
			</Pressable>
		</View>
	);
};

export { GenderSelector };
