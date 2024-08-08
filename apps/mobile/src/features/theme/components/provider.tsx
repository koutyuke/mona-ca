import { themeColorVariables } from "@mona-ca/tailwind-config";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import type { FC, ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../hooks";

type Props = {
	children: ReactNode;
};

const ThemeProvider: FC<Props> = ({ children }) => {
	const [colorScheme] = useTheme();

	return (
		<View className="h-full w-full bg-transparent" style={vars(themeColorVariables[colorScheme])}>
			{children}
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
		</View>
	);
};

export { ThemeProvider };
