import { useEffect } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../mobile/src/layers/entities/theme";
import StoryBookRoot from "../../.rnstorybook";

import type { FC } from "react";

const isStoryBookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

const Home: FC = () => {
	const { setTheme } = useTheme();

	useEffect(() => {
		setTheme("system");
	}, [setTheme]);

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
