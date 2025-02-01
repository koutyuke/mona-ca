import { cssInterop } from "nativewind";
import { type ComponentPropsWithoutRef, type FC, useEffect } from "react";
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Rect, Svg } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type AnimationRectProps = {
	index: number;
} & ComponentPropsWithoutRef<typeof Rect>;

const MIN_OPACITY = 0.2;
const MAX_OPACITY = 1;
const OPACITY_RATE = 0.1;
const DURATION = 1000;
const DURATION_RATE = 125;

cssInterop(Svg, {
	className: {
		target: "style",
	},
});

const AnimationRect: FC<AnimationRectProps> = ({ index, ...props }) => {
	const initialOpacity = MAX_OPACITY - index * OPACITY_RATE;
	const initialDuration = DURATION - index * DURATION_RATE;

	const opacity = useSharedValue(initialOpacity);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		opacity.value = withTiming(MIN_OPACITY, { duration: initialDuration });
		setTimeout(() => {
			opacity.value = MAX_OPACITY;
			opacity.value = withRepeat(
				withTiming(MIN_OPACITY, { duration: DURATION, easing: Easing.out(Easing.circle) }),
				-1,
				false,
			);
		}, initialDuration);
	}, []);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return <AnimatedRect {...props} opacity={opacity as any} />;
};

type LoadingSpinnerProps = {
	className?: string;
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ className }) => {
	return (
		<Svg viewBox="0 0 120 120" className={className ?? ""}>
			<AnimationRect
				index={0}
				x="78.9454"
				y="51.1612"
				width="15"
				height="40"
				rx="7.5"
				transform="rotate(-135 78.9454 51.1612)"
			/>
			<AnimationRect index={1} x="80" y="67.5" width="15" height="40" rx="7.5" transform="rotate(-90 80 67.5)" />
			<AnimationRect
				index={2}
				x="68.3389"
				y="79.4454"
				width="15"
				height="40"
				rx="7.5"
				transform="rotate(-45 68.3389 79.4454)"
			/>
			<AnimationRect index={3} x="52" y="80" width="15" height="40" rx="7.5" />
			<AnimationRect
				index={4}
				x="22.377"
				y="107.73"
				width="15"
				height="40"
				rx="7.5"
				transform="rotate(-135 22.377 107.73)"
			/>
			<AnimationRect index={5} y="67.5" width="15" height="40" rx="7.5" transform="rotate(-90 0 67.5)" />
			<AnimationRect
				index={6}
				x="11.7703"
				y="22.8769"
				width="15"
				height="40"
				rx="7.5"
				transform="rotate(-45 11.7703 22.8769)"
			/>
			<AnimationRect index={7} x="52" width="15" height="40" rx="7.5" />
		</Svg>
	);
};

export { LoadingSpinner };
