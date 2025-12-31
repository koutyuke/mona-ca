import { cn } from "@mona-ca/tailwind-helpers";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "../../../../entities/theme";
import { useLayoutInsets, vh } from "../../../../shared/lib/view";

import type { ComponentProps } from "react";

type Props = {
	indicatorStyle?: "white" | "black";
} & Omit<ComponentProps<typeof KeyboardAwareScrollView>, "indicatorStyle" | "alwaysBounceVertical">;

export const PageFrame = ({ indicatorStyle, scrollIndicatorInsets, className, children, ref, ...props }: Props) => {
	const { top, bottom } = useLayoutInsets();
	const { resolvedTheme } = useTheme();
	return (
		<KeyboardAwareScrollView
			alwaysBounceVertical={false}
			bottomOffset={16}
			className={cn("bg-slate-1", className)}
			indicatorStyle={indicatorStyle ?? (resolvedTheme === "dark" ? "white" : "black")}
			ref={ref}
			scrollIndicatorInsets={
				scrollIndicatorInsets ?? {
					top,
					bottom,
				}
			}
			{...props}
		>
			{children}
		</KeyboardAwareScrollView>
	);
};

export const BODY_MIN_HEIGHT = vh(100) - 1;

export const BODY_TOP_PADDING = 24;
