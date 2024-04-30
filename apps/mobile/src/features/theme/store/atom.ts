import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { Theme } from "../type";

const storage = createJSONStorage<Theme>(() => AsyncStorage);

export const themeAtom = atomWithStorage<Theme>("themeAtom", { colorScheme: "light" }, storage);
