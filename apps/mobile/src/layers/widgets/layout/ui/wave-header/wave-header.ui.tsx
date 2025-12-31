import { Text } from "@mona-ca/ui/native/components";
import { ChevronLeftIcon } from "@mona-ca/ui/native/icons";
import { Pressable, View } from "react-native";
import { useLayoutInsets } from "../../../../shared/lib/view";
import { Wave } from "../../../../shared/ui/wave";

import type { JSX, ReactNode } from "react";

type Props = {
	title: string;
	subTitle?: string;
	enableBackButton?: boolean;
	backButtonLabel?: string;
	rightContents?: ReactNode;
	actions: {
		onBack: () => void;
	};
};

export const WaveHeaderUI = ({
	title,
	subTitle,
	enableBackButton,
	backButtonLabel,
	rightContents,
	actions,
}: Props): JSX.Element => {
	const { top } = useLayoutInsets();
	return (
		<View className={"flex w-full flex-col bg-salmon-6"} style={{ paddingTop: top, height: top + 44 }}>
			<View className="flex h-11 w-full flex-row items-center justify-between">
				<View className="pl-2">
					{enableBackButton && (
						<Pressable className="flex flex-row items-center transition active:opacity-50" onPress={actions.onBack}>
							<ChevronLeftIcon className="text-white" size={28} />
							<Text className="text-white" size="md" weight="medium">
								{backButtonLabel}
							</Text>
						</Pressable>
					)}
				</View>
				<View className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
					<Text className="text-white" size="md" weight="medium">
						{title}
					</Text>
					{subTitle && (
						<Text className="text-white" size="sm">
							{subTitle}
						</Text>
					)}
				</View>
				<View className="pr-2">{rightContents}</View>
			</View>
			<View className="h-8 w-full">
				<Wave className="color-salmon-6 w-full" />
			</View>
		</View>
	);
};
