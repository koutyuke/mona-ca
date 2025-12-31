import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { vw } from "../../../../shared/lib/view";
import { FeatureCardUI } from "./card/feature-card.ui";

const ITEM_WIDTH = vw(75);
const SPACING = vw(7.5);
const PADDING = vw(12.5);
const SNAP_INTERVAL = ITEM_WIDTH + SPACING;

export const FeatureCarouselUI = () => {
	const listRef = useAnimatedRef<Animated.ScrollView>();

	const scrollX = useSharedValue(0);

	const onScroll = useAnimatedScrollHandler({
		onScroll: e => {
			scrollX.value = e.contentOffset.x;
		},
		onMomentumEnd: e => {
			const index = Math.round(e.contentOffset.x / SNAP_INTERVAL);
			scrollTo(listRef, index * SNAP_INTERVAL, 0, true);
		},
	});

	return (
		<Animated.ScrollView
			bounces={false}
			className="flex-grow-0"
			contentContainerStyle={{
				paddingHorizontal: PADDING,
				gap: SPACING,
			}}
			decelerationRate="fast"
			horizontal
			onScroll={onScroll}
			ref={listRef}
			scrollEventThrottle={16}
			showsHorizontalScrollIndicator={false}
			snapToInterval={SNAP_INTERVAL}
		>
			<FeatureCardUI className="w-[75vw]" variant="mona-ca" />
			<FeatureCardUI className="w-[75vw]" variant="customize" />
			<FeatureCardUI className="w-[75vw]" variant="share" />
		</Animated.ScrollView>
	);
};
