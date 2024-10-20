import { Wave } from "@mobile/shared/ui/wave";
import { Heading } from "@mona-ca/ui/native/components";
import type { FC } from "react";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { PAGE_WAVE_TITLE_TEXT_LINE_HEIGHT } from "../../constants/page-wave-title";

type PageWaveTitleProps = {
	title: string;
	titleLines: number;
	waveAnimatedStyle: {
		verticalTranslate: SharedValue<number>;
	};
	padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
};

const PageWaveTitlePresenter: FC<PageWaveTitleProps> = ({
	title,
	titleLines,
	waveAnimatedStyle: { verticalTranslate: waveVerticalTranslate },
	padding: { top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft },
}) => {
	const pageTitleVerticalTranslateStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: waveVerticalTranslate.value }],
		};
	});

	return (
		<View className="z-40 flex w-full flex-col">
			<View
				className="light w-full bg-mona-ca"
				style={{
					paddingTop: paddingTop,
					paddingLeft: paddingLeft,
					paddingRight: paddingRight,
					paddingBottom: paddingBottom,
					height: paddingTop + PAGE_WAVE_TITLE_TEXT_LINE_HEIGHT * titleLines + paddingBottom,
				}}
			>
				<Heading level="1" bold className="text-slate-1">
					{title}
				</Heading>
			</View>
			<Animated.View className="w-screen" style={pageTitleVerticalTranslateStyle}>
				<Wave className="light w-screen fill-mona-ca" />
			</Animated.View>
		</View>
	);
};

export { PageWaveTitlePresenter };
