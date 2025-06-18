import { type FC, useEffect } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../mobile/src/features/theme";
import StoryBookRoot from "../../.storybook/mobile";

const isStoryBookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

const Home: FC = () => {
	const setTheme = useTheme()[1];

	// on initial render, set the theme to the system color scheme
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setTheme({ colorTheme: "system" });
	}, []);

	if (isStoryBookEnabled) {
		return <StoryBookRoot />;
	}

	return (
		<View
			style={{
				height: "100%",
				width: "100%",
				justifyContent: "center",
				alignItems: "center",
				display: "flex",
			}}
		>
			<Text>Home</Text>
		</View>
	);
};

export default Home;
