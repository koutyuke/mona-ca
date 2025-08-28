import { useAtom } from "jotai";
import { useColorScheme } from "react-native";
import { themeAtom } from "../model/theme";

export const useTheme = () => {
	const systemTheme = useColorScheme();
	const [theme, setTheme] = useAtom(themeAtom);

	return { theme, systemTheme: systemTheme ?? "light", setTheme } as const;
};
