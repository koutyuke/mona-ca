import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useColorScheme } from "react-native";
import { storageKeys, storeStorage } from "../../../shared/lib";

export type Theme = "light" | "dark" | "system";

export const themeAtom = atomWithStorage<Theme>(storageKeys.theme, "light", storeStorage);

export const useTheme = () => {
	const systemSTheme = useColorScheme();
	const [theme, setScheme] = useAtom(themeAtom);

	return { theme, systemTheme: systemSTheme ?? "light", setScheme } as const;
};
