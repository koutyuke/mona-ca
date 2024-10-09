import { StatusBar } from "expo-status-bar";
import type { FC, ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../models/theme";

type ThemeProviderProps = {
	children: ReactNode;
};

const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
	const [colorTheme] = useTheme();
	return (
		<View className={`${colorTheme !== "dark" ? "light" : "dark"} h-full w-full`}>
			{children}
			<StatusBar style={colorTheme === "dark" ? "light" : "dark"} />
		</View>
	);
};

type CustomThemeProviderProps = {
	children: ReactNode;
	styleTheme?: "light" | "dark";
	statusBarStyle?: "light" | "dark";
};

const CustomThemeProvider: FC<CustomThemeProviderProps> = ({
	children,
	styleTheme = "light",
	statusBarStyle = "light",
}) => {
	return (
		<View className={`${styleTheme} h-full w-full`}>
			{children}
			<StatusBar style={statusBarStyle} />
		</View>
	);
};

export { ThemeProvider, CustomThemeProvider };
