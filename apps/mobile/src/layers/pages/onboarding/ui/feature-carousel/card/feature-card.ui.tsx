import { cn } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import { View } from "react-native";
import { FeatureCardIconUI } from "../card-icon/feature-card-icon.ui";

import type { ReactNode } from "react";

type Props = {
	variant: "mona-ca" | "customize" | "share";
	className?: string;
};

const textVariants = {
	"mona-ca": {
		title: "mona-ca",
		description: "生理をもっとわかりやすく、共有しやすくするためのアプリです。",
	},
	customize: {
		title: "Customize",
		description: "共有内容や画面レイアウトなどを自由にカスタマイズできます。",
	},
	share: {
		title: "Share",
		description: "周期や体調、日用品などをかんたんに共有することができます。",
	},
};

export const FeatureCardUI = ({ variant, className }: Props): ReactNode => {
	return (
		<View
			className={cn("flex aspect-[3_/_4] flex-col gap-3 rounded-2xl border border-slate-7 bg-slate-2 p-6", className)}
		>
			<View
				className={cn(
					"flex w-full flex-1 items-center justify-center rounded-xl",
					variant === "mona-ca" && "bg-salmon-6",
					variant === "customize" && "bg-blue-9",
					variant === "share" && "bg-[#FFDCC3]",
				)}
			>
				<FeatureCardIconUI className="h-full max-h-40" variant={variant} />
			</View>
			<View className="flex h-24 w-full flex-col gap-2">
				<Text size="lg" weight="medium">
					{textVariants[variant].title}
				</Text>
				<Text className="text-slate-11" weight="regular">
					{textVariants[variant].description}
				</Text>
			</View>
		</View>
	);
};
