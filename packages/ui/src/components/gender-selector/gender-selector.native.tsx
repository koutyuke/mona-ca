import { cn, tv } from "@mona-ca/tailwind-helpers";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { CalendarHeartIcon, CalendarXIcon } from "../../icons/index.native";
import { Text } from "../text/index.native";

import type { FC } from "react";

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
				icon: "color-white",
				text: "text-white",
			},
			false: {
				pressable: "bg-slate-3",
				icon: "color-slate-9",
				text: "text-slate-9",
			},
		},
	},
});

const label = {
	man: "生理がこない",
	woman: "生理がくる",
};

const GenderSelector: FC<GenderSelectorProps> = ({ value, onChange = () => {}, className }) => {
	const [gender, setGender] = useState<Gender | null>(value ?? null);

	const { pressable: pressableStyle, icon: iconStyle, text: textStyle } = styleVariants();

	return (
		<View className={cn("flex w-full flex-col items-center gap-2", className)}>
			<View className="flex w-full flex-row gap-4">
				<Pressable
					className={pressableStyle({ isSelected: gender === "woman" })}
					onPress={() => {
						setGender("woman");
						onChange("woman");
					}}
				>
					<CalendarHeartIcon className={iconStyle({ isSelected: gender === "woman" })} />
					<Text className={textStyle({ isSelected: gender === "woman" })} size="sm">
						{label.woman}
					</Text>
				</Pressable>

				<Pressable
					className={pressableStyle({ isSelected: gender === "man" })}
					onPress={() => {
						setGender("man");
						onChange("man");
					}}
				>
					<CalendarXIcon className={iconStyle({ isSelected: gender === "man" })} />
					<Text className={textStyle({ isSelected: gender === "man" })} size="sm">
						{label.man}
					</Text>
				</Pressable>
			</View>
			<Text className="text-slate-9" size="sm">
				{gender ? `「${label[gender]}」を選択中` : "未選択"}
			</Text>
		</View>
	);
};

export { GenderSelector };
