import type { FC } from "react";
import { Text, View } from "react-native";
import StoryBookRoot from "../../.storybook/mobile";

const isStoryBookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

const Home: FC = () => {
	if (isStoryBookEnabled) {
		return <StoryBookRoot />;
	}
	return (
		<View
			style={{
				height: "100%",
				justifyContent: "center",
				alignItems: "center",
				display: "flex",
				width: "100%",
			}}
		>
			<Text>Home</Text>
		</View>
	);
};

export default Home;
