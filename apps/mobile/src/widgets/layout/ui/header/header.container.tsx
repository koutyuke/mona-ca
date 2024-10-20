import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { type FC, type ReactNode, useRef } from "react";
import type Animated from "react-native-reanimated";
import {
	type AnimatedRef,
	useAnimatedReaction,
	useScrollViewOffset,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderPresenter } from "./header.presenter";

type Props = {
	animatedBodyRef: AnimatedRef<Animated.ScrollView>;

	title: string | ReactNode | ((routeName: string) => string | ReactNode);
	subTitle?: string;
	enableTitleAnimation?: boolean;
	titleColorClassName?: string;
	titleAnimationTriggerPoint?: number | ((unsafeAreaTopSpace: number) => number);

	backButtonLabel?: string | ((backTitle: string | undefined) => string);
	enableBackButton?: boolean;
	backButtonColorClassName?: string;

	headerClassName?: string;

	rightContents?: ReactNode;
	leftContents?: ReactNode;
};

type Container = (props: Props) => FC<NativeStackHeaderProps>;

const HeaderContainer: Container = ({
	animatedBodyRef,
	title,
	enableTitleAnimation = true,
	titleAnimationTriggerPoint: _titleAnimationTriggerPoint = 0,
	backButtonLabel,

	enableBackButton = true,

	...props
}) => {
	const bodyOffset = useScrollViewOffset(animatedBodyRef);
	const insets = useSafeAreaInsets();
	const titleAnimationTriggerPoint =
		typeof _titleAnimationTriggerPoint === "function"
			? _titleAnimationTriggerPoint(insets.top)
			: _titleAnimationTriggerPoint;

	const opacitySharedValue = useSharedValue(0);
	const scrollDirection = useRef<"up" | "down" | undefined>(undefined);

	useAnimatedReaction(
		() => (bodyOffset.value > 0 ? bodyOffset.value : 0),
		(currentValue, previousValue) => {
			if (!previousValue || !previousValue) {
				return;
			}

			if (currentValue > previousValue) {
				// scroll down
				if (scrollDirection.current !== "down" && currentValue >= titleAnimationTriggerPoint) {
					opacitySharedValue.value = withTiming(1, {
						duration: 250,
					});

					scrollDirection.current = "down";
				}
			} else {
				// scroll up
				if (scrollDirection.current !== "up" && currentValue <= titleAnimationTriggerPoint) {
					opacitySharedValue.value = withTiming(0, {
						duration: 250,
					});

					scrollDirection.current = "up";
				}
			}
		},
	);

	return ({ route, back }: NativeStackHeaderProps) => {
		return (
			<HeaderPresenter
				title={typeof title === "function" ? title(route.name) : title}
				enableTitleAnimation={enableTitleAnimation}
				titleAnimatedStyle={{
					opacity: enableTitleAnimation ? opacitySharedValue : undefined,
				}}
				enableBackButton={enableBackButton}
				backButtonLabel={
					(typeof backButtonLabel === "function" ? backButtonLabel(back?.title) : backButtonLabel) ?? "戻る"
				}
				unsafeAreaSpace={{
					top: insets.top,
					right: insets.right < 16 ? 16 : insets.right,
					bottom: 0,
					left: insets.left < 16 ? 16 : insets.left,
				}}
				{...props}
			/>
		);
	};
};

export { HeaderContainer as Header };
