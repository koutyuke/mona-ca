import { forwardRef } from "react";
import { type ScrollView, type ScrollViewProps, type StyleProp, View, type ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../../features/theme";
import { useLayoutInsets } from "../../../../shared/hooks";
import { HEADER_HEIGHT } from "../../constants";

type ScrollBodyProps = {
	withTabs?: boolean;
	keyboardAwareScrollViewClassName?: string;
	keyboardAwareScrollViewStyle?: StyleProp<ViewStyle>;
	innerViewClassName?: string;
	innerViewStyle?: StyleProp<ViewStyle>;
} & Omit<ScrollViewProps, "className" | "style">;

const _ScrollBody = forwardRef<ScrollView, ScrollBodyProps>(
	(
		{
			indicatorStyle,
			scrollIndicatorInsets,
			innerViewStyle,
			innerViewClassName,
			keyboardAwareScrollViewClassName,
			keyboardAwareScrollViewStyle,
			children,
			withTabs = true,
			...props
		},
		ref,
	) => {
		const insets = useLayoutInsets();
		const colorTheme = useTheme()[0];
		return (
			<KeyboardAwareScrollView
				ref={ref}
				indicatorStyle={
					!indicatorStyle || indicatorStyle === "default" ? (colorTheme === "dark" ? "white" : "black") : indicatorStyle
				}
				scrollIndicatorInsets={{
					top: HEADER_HEIGHT,
					bottom: insets.bottom,
				}}
				bottomOffset={18}
				className={keyboardAwareScrollViewClassName || ""}
				style={keyboardAwareScrollViewStyle}
				{...props}
			>
				<View className={innerViewClassName || ""} style={innerViewStyle}>
					{children}
				</View>
			</KeyboardAwareScrollView>
		);
	},
);

const ScrollBody = Animated.createAnimatedComponent(_ScrollBody);
const Body = Animated.View;

export { Body, ScrollBody };
