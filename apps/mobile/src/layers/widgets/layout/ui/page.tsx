import { cn } from "@mona-ca/tailwind-helpers";
import { forwardRef } from "react";
import type { ScrollView, ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../features/theme";
import { useLayoutInsets, vh } from "../../../shared/lib/view";

type BodyProps = {
	indicatorStyle?: "white" | "black";
} & Omit<ScrollViewProps, "indicatorStyle" | "alwaysBounceVertical">;

export const Page = forwardRef<ScrollView, BodyProps>(
	({ indicatorStyle, scrollIndicatorInsets, className, children, ...props }, ref) => {
		const { top, bottom } = useLayoutInsets();
		const { theme, systemTheme } = useTheme();
		return (
			<KeyboardAwareScrollView
				ref={ref}
				alwaysBounceVertical={false}
				bottomOffset={16}
				indicatorStyle={indicatorStyle ?? ((theme === "system" ? systemTheme : theme) === "dark" ? "white" : "black")}
				scrollIndicatorInsets={
					scrollIndicatorInsets ?? {
						top,
						bottom,
					}
				}
				className={cn("bg-slate-1", className)}
				{...props}
			>
				{children}
			</KeyboardAwareScrollView>
		);
	},
);

export const AnimatedPage = Animated.createAnimatedComponent(Page);

export const BODY_MIN_HEIGHT = vh(100) - 1;
