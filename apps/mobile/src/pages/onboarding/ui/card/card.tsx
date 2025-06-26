import { cn } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import type { ReactNode } from "react";
import { View } from "react-native";
import { CardIcon } from "../card-icon/card-icon";

type Props = {
	variant: "mona-ca" | "customize" | "share";
	className?: string;
};

const textVariants = {
	"mona-ca": {
		title: "mona-ca",
		description: "mona-ca は、生理をもっとわかりやすく・共有しやすくするためのアプリです",
	},
	customize: {
		title: "Customize",
		description: "共有内容やホーム画面の表示レイアウトもすべて自分好みにカスタマイズできます",
	},
	share: {
		title: "Share",
		description: "あなたの周期を予測して信頼できる人にかんたんに共有することができます",
	},
};

const OnboardingCard = ({ variant, className }: Props): ReactNode => {
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
				<CardIcon variant={variant} className="h-full max-h-40" />
			</View>
			<View className="flex h-24 w-full flex-col gap-2">
				<Text size="lg" weight="medium">
					{textVariants[variant].title}
				</Text>
				<Text size="xs" weight="regular" className="text-slate-11">
					{textVariants[variant].description}
				</Text>
			</View>
		</View>
	);
};

export { OnboardingCard };
