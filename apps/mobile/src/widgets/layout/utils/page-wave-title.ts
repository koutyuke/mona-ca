import {
	PAGE_WAVE_TITLE_TEXT_BOTTOM_PADDING,
	PAGE_WAVE_TITLE_TEXT_LINE_HEIGHT,
	PAGE_WAVE_TITLE_TEXT_TOP_PADDING,
} from "../constants";

export const calculateHeaderAnimationTriggerPointOfPageWaveTitle = (titleLines: number): number => {
	return (
		titleLines * PAGE_WAVE_TITLE_TEXT_LINE_HEIGHT +
		PAGE_WAVE_TITLE_TEXT_TOP_PADDING +
		PAGE_WAVE_TITLE_TEXT_BOTTOM_PADDING
	);
};
