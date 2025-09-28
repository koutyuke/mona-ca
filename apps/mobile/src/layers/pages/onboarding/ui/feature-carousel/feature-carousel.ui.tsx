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
			ref={listRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			bounces={false}
			decelerationRate="fast"
			snapToInterval={SNAP_INTERVAL}
			scrollEventThrottle={16}
			contentContainerStyle={{
				paddingHorizontal: PADDING,
				gap: SPACING,
			}}
			className="flex-grow-0"
			onScroll={onScroll}
		>
			<FeatureCardUI variant="mona-ca" className="w-[75vw]" />
			<FeatureCardUI variant="customize" className="w-[75vw]" />
			<FeatureCardUI variant="share" className="w-[75vw]" />
		</Animated.ScrollView>
	);
};
