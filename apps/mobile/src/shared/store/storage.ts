import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "jotai/utils";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const localStorage = createJSONStorage<any>(() => AsyncStorage);

export { localStorage };
