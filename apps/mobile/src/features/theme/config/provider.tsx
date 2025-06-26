import { StatusBar } from "expo-status-bar";
import type { FC, ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../model/theme";

type ThemeProviderProps = {
	children: ReactNode;
	theme?: "light" | "dark" | "system";
	statusBarStyle?: "light" | "dark";
};

const ThemeProvider: FC<ThemeProviderProps> = ({ children, theme: customTheme, statusBarStyle }) => {
	const { theme: _theme, systemTheme } = useTheme();

	const theme = customTheme ?? _theme;
	const lightOrDark = theme === "system" ? systemTheme : theme;

	return (
		<View className={`${lightOrDark} h-full w-full`}>
			{children}
			<StatusBar style={(statusBarStyle ?? lightOrDark) === "dark" ? "light" : "dark"} />
		</View>
	);
};

export { ThemeProvider };
