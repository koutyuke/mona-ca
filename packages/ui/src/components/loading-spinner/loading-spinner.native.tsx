import { cn } from "@mona-ca/tailwind-helpers";
import { type FC, useEffect } from "react";
import { View } from "react-native";
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

const MIN_OPACITY = 0.25;
const DURATION = 1000;
const HALF_ANGLE = 120;

const INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

type LoadingSpinnerProps = {
	size?: number;
	color: "gray" | "white" | "black";
};

const colorVariants = {
	gray: "bg-slate-11",
	white: "bg-white",
	black: "bg-black",
} as const;

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 32, color = "gray" }) => {
	const barH = size * 0.33;
	const barW = size * 0.14;

	const radius = size / 2 - barH / 2;

	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = 0;
		progress.value = withRepeat(withTiming(360, { duration: DURATION, easing: Easing.linear }), -1, false);
		return () => cancelAnimation(progress);
	}, [progress]);

	const angleDist = (target: number, base: number) => {
		"worklet";
		const d = Math.abs(((target - base + 540) % 360) - 180);
		return d; // 0..180
	};

	const falloff = (dist: number, half: number) => {
		"worklet";
		if (dist >= half) return 0;
		const x = dist / half; // 0..1
		return 0.5 * (1 + Math.cos(Math.PI * x)); // 1..0
	};

	return (
		<View style={{ width: size, height: size }}>
			{INDICES.map(index => {
				const angle = (360 / INDICES.length) * index;
				const half = Math.max(1, HALF_ANGLE / 2);

				const barStyle = useAnimatedStyle(() => {
					const dist = angleDist(angle, progress.value);
					const w = falloff(dist, half); // 0..1
					const opacity = MIN_OPACITY + (1 - MIN_OPACITY) * w;
					return {
						opacity,
					};
				}, [angle, half]);
				return (
					<Animated.View
						key={index}
						style={[
							{
								position: "absolute",
								top: size / 2 - barH / 2,
								left: size / 2 - barW / 2,
								width: barW,
								height: barH,
								borderRadius: barW / 2,
								transform: [{ rotate: `${angle}deg` }, { translateY: -radius }],
							},
							barStyle,
						]}
						className={cn(colorVariants[color])}
					/>
				);
			})}
		</View>
	);
};
