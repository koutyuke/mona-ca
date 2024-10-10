import { useSafeAreaInsets } from "react-native-safe-area-context";

const useLayoutInsets = () => {
	const insets = useSafeAreaInsets();
	const { top, bottom, left, right } = insets;

	return {
		top,
		topWithHeader: top + 56,
		bottom,
		left: left < 16 ? 16 : left,
		right: right < 16 ? 16 : right,
	};
};

export { useLayoutInsets };
