import { useTheme } from "@mobile/features/theme";
import { useLayoutInsets } from "@mobile/shared/hooks";
import { forwardRef } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import Animated from "react-native-reanimated";
import { HEADER_HEIGHT } from "../../constants";

type ScrollBodyProps = {
	withTabs?: boolean;
} & ScrollViewProps;

const _ScrollBody = forwardRef<ScrollView, ScrollBodyProps>(
	({ indicatorStyle, scrollIndicatorInsets, withTabs = true, ...props }, ref) => {
		const insets = useLayoutInsets();
		const colorTheme = useTheme()[0];
		return (
			<ScrollView
				ref={ref}
				indicatorStyle={
					!indicatorStyle || indicatorStyle === "default" ? (colorTheme === "dark" ? "white" : "black") : indicatorStyle
				}
				scrollIndicatorInsets={{
					top: HEADER_HEIGHT,
					bottom: insets.bottom,
				}}
				{...props}
			/>
		);
	},
);

const ScrollBody = Animated.createAnimatedComponent(_ScrollBody);
const Body = Animated.View;

export { Body, ScrollBody };
