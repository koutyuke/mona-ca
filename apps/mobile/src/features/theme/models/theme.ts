import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useColorScheme } from "react-native";
import { localStorage } from "../../../shared/store";
import type { ThemeStorage } from "../types/theme";

const themeAtom = atomWithStorage<ThemeStorage>("themeAtom", { colorTheme: "light" }, localStorage);

const useTheme = () => {
	const systemScheme = useColorScheme();
	const [{ colorTheme }, setScheme] = useAtom(themeAtom);

	return [colorTheme === "system" ? (systemScheme ?? "light") : colorTheme, setScheme] as const;
};

export { useTheme, themeAtom };
