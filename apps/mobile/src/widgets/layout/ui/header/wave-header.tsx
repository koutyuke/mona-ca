import { cn } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import { ChevronLeftIcon } from "@mona-ca/ui/native/icons";
import { useNavigation } from "expo-router";
import type { FC, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useLayoutInsets } from "../../../../shared/lib";
import { Wave } from "../../../../shared/ui";

type Props = {
	title: string;
	subTitle?: string;
	className?: string;

	enableBackButton?: boolean;
	backButtonLabel?: string;

	rightContents?: ReactNode;
};

export const WaveHeader: FC<Props> = ({
	title,
	subTitle,
	className,
	enableBackButton,
	backButtonLabel,
	rightContents,
}) => {
	const { top } = useLayoutInsets();
	const navigation = useNavigation();

	return (
		<View className={cn("flex w-full flex-col bg-salmon-6", className)} style={{ paddingTop: top, height: top + 44 }}>
			<View className="flex h-11 w-full flex-row items-center justify-between">
				<View className="pl-2">
					{enableBackButton && (
						<Pressable className="flex flex-row items-center transition active:opacity-50" onPress={navigation.goBack}>
							<ChevronLeftIcon className="text-white" size={24} />
							<Text size="md" weight="medium" className="text-white">
								{backButtonLabel}
							</Text>
						</Pressable>
					)}
				</View>
				<View className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex flex-col items-center">
					<Text size="md" weight="medium" className="text-white">
						{title}
					</Text>
					{subTitle && (
						<Text size="xs" className="text-white">
							{subTitle}
						</Text>
					)}
				</View>
				<View className="pr-2">{rightContents}</View>
			</View>
			<View className="h-8 w-full">
				<Wave className="w-full fill-salmon-6" />
			</View>
		</View>
	);
};
