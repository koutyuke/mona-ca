import { useAtom } from "jotai";
import { useColorScheme } from "react-native";
import { themeAtom } from "./theme-atom";

export const useTheme = () => {
	const systemTheme = useColorScheme() ?? "light";
	const [theme, setTheme] = useAtom(themeAtom);

	const resolvedTheme = theme === "system" ? systemTheme : theme;

	return { theme, systemTheme, resolvedTheme, setTheme } as const;
};
