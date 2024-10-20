import { type FC, useState } from "react";
import { Pressable, View } from "react-native";
import { UserIcon } from "../../icons/index.native";
import { Text } from "../text/index.native";

type Gender = "man" | "woman";

type GenderSelectorProps = {
	defaultGender?: Gender;
	onChange?: (gender: Gender) => void;
	className?: string;
};

const GenderSelector: FC<GenderSelectorProps> = ({ defaultGender = "man", onChange = () => {}, className }) => {
	const [gender, setGender] = useState<Gender>(defaultGender);

	return (
		<View className={`gap-2 ${className}`}>
			<View className="flex w-full flex-row gap-4">
				<Pressable
					className={`flex aspect-[4_/_3] flex-1 items-center justify-center rounded-lg ${gender === "man" ? "bg-blue-8" : "bg-slate-7"}`}
					onPress={() => {
						onChange("man");
						setGender("man");
					}}
				>
					<UserIcon className="size-[40%] stroke-white" />
					<Text size="md" bold className="text-white">
						男性
					</Text>
					<Text size="sm" bold className="text-white">
						(生理が来ない)
					</Text>
				</Pressable>
				<Pressable
					className={`flex aspect-[4_/_3] flex-1 items-center justify-center rounded-lg ${gender === "woman" ? "bg-crimson-9/80" : "bg-slate-7"}`}
					onPress={() => {
						onChange("woman");
						setGender("woman");
					}}
				>
					<UserIcon className="size-[40%] stroke-white" />
					<Text size="md" bold className="text-white">
						女性
					</Text>
					<Text size="sm" bold className="text-white">
						(生理が来る)
					</Text>
				</Pressable>
			</View>
			<View className="flex w-full flex-row justify-center gap-1">
				<Text size="sm" bold className={`${gender === "man" ? "text-blue-8" : "text-crimson-9/80"}`}>
					{gender === "man" ? "男性(生理が来ない)" : "女性(生理が来る)"}
				</Text>
				<Text size="sm">を選択中</Text>
			</View>
		</View>
	);
};

export { GenderSelector };
