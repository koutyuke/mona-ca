// import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAtom } from "jotai";
import { useColorScheme } from "react-native";
import { themeAtom } from "../store/atom";

const useTheme = () => {
	const systemScheme = useColorScheme();
	const [{ colorScheme }, setScheme] = useAtom(themeAtom);

	return [colorScheme === "system" ? systemScheme ?? "light" : colorScheme, setScheme] as const;
};

export { useTheme };
