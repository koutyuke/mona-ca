import type { FC } from "react";
import type Animated from "react-native-reanimated";
import { type AnimatedRef, useDerivedValue, useScrollViewOffset } from "react-native-reanimated";
import { useLayoutInsets } from "../../../../shared/hooks";
import {
	PAGE_WAVE_TITLE_TEXT_BOTTOM_PADDING,
	PAGE_WAVE_TITLE_TEXT_LINE_HEIGHT,
	PAGE_WAVE_TITLE_TEXT_TOP_PADDING,
} from "../../constants";
import { PageWaveTitlePresenter } from "./page-wave-title.presenter";

type PageWaveTitleProps = {
	animatedBodyRef: AnimatedRef<Animated.ScrollView>;
	title: string | string[];
};

const PageWaveTitle: FC<PageWaveTitleProps> = ({ title: _title, animatedBodyRef }) => {
	const offset = useScrollViewOffset(animatedBodyRef);
	const titleLines = Array.isArray(_title) ? _title.length : 1;
	const title = Array.isArray(_title) ? _title.join("\n") : _title;
	const waveStopPoint =
		PAGE_WAVE_TITLE_TEXT_TOP_PADDING +
		PAGE_WAVE_TITLE_TEXT_LINE_HEIGHT * titleLines +
		PAGE_WAVE_TITLE_TEXT_BOTTOM_PADDING;

	const { topWithHeader, left, right } = useLayoutInsets();

	const verticalTranslateStyle = useDerivedValue(() => {
		return offset.value > waveStopPoint ? offset.value - waveStopPoint : 0;
	});

	return (
		<PageWaveTitlePresenter
			title={title}
			titleLines={titleLines}
			padding={{
				top: topWithHeader + PAGE_WAVE_TITLE_TEXT_TOP_PADDING,
				right: right,
				bottom: PAGE_WAVE_TITLE_TEXT_BOTTOM_PADDING,
				left: left,
			}}
			waveAnimatedStyle={{
				verticalTranslate: verticalTranslateStyle,
			}}
		/>
	);
};

export { PageWaveTitle };
