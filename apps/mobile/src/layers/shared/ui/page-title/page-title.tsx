import { cn } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import type { ReactNode } from "react";
import { View } from "react-native";

type Props = {
	children: ReactNode;
	className?: string;
};

export const PageTitle = ({ children, className }: Props) => {
	return (
		<View className={cn("flex w-full flex-col justify-center", className)}>
			<Text size="xl" weight="medium">
				{children}
			</Text>
			<View className="h-1 w-20 rounded-full bg-salmon-6" />
		</View>
	);
};
