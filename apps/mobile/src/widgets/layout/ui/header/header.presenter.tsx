import { twMerge } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import { ChevronIcon } from "@mona-ca/ui/native/icons";
import { Link } from "expo-router";
import type { FC, ReactNode } from "react";
import { Pressable, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

type Props = {
	title: string | ReactNode;
	subTitle?: string;
	enableTitleAnimation?: boolean;
	titleAnimatedStyle?: {
		opacity?: SharedValue<number> | undefined;
	};
	titleColorClassName?: string;

	backButtonLabel?: string;
	enableBackButton?: boolean;
	backButtonColorClassName?: string;

	headerClassName?: string;

	rightContents?: ReactNode;
	leftContents?: ReactNode;
	unsafeAreaSpace: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
};

const HeaderPresenter: FC<Props> = ({
	title,
	subTitle,
	enableTitleAnimation = true,
	titleAnimatedStyle: { opacity: titleAnimatedOpacity } = {},
	titleColorClassName,

	backButtonLabel,
	enableBackButton = true,
	backButtonColorClassName,

	headerClassName,

	rightContents,
	leftContents,
	unsafeAreaSpace,
}) => {
	const titleAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: titleAnimatedOpacity?.value,
		};
	});

	return (
		<View
			className={twMerge(
				"flex w-full flex-row items-center justify-between border-none bg-slate-1 dark:bg-slate-3",
				headerClassName,
			)}
			style={{
				height: 56 + unsafeAreaSpace.top,
				paddingTop: unsafeAreaSpace.top,
				paddingRight: unsafeAreaSpace.right,
				paddingBottom: unsafeAreaSpace.bottom,
				paddingLeft: unsafeAreaSpace.left - 10,
			}}
		>
			<View className="flex flex-1 flex-row items-center justify-start">
				{leftContents ??
					(enableBackButton ? (
						<Link href=".." asChild>
							<Pressable className="group flex flex-row items-center justify-center">
								<ChevronIcon
									className={`size-8 transition ${backButtonColorClassName ?? "color-blue-9 group-active:color-blue-8 "}`}
								/>
								<Text
									size="md"
									bold
									className={`transition ${backButtonColorClassName ?? "color-blue-9 group-active:color-blue-8 "}`}
								>
									{backButtonLabel}
								</Text>
							</Pressable>
						</Link>
					) : null)}
			</View>
			<View className="flex h-full justify-center overflow-hidden">
				{typeof title === "string" ? (
					<Animated.View className="flex items-center" style={enableTitleAnimation && titleAnimatedStyle}>
						<Text size="lg" bold className={titleColorClassName ?? "color-slate-12"}>
							{title}
						</Text>
						{subTitle && (
							<Text size="sm" className={titleColorClassName ?? "color-slate-12"}>
								{subTitle}
							</Text>
						)}
					</Animated.View>
				) : (
					title
				)}
			</View>
			<View className="flex w-1 flex-1 flex-row items-center justify-end">{rightContents}</View>
		</View>
	);
};

export { HeaderPresenter };
