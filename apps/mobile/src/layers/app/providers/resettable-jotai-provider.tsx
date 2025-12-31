import { createStore, Provider } from "jotai";
import { createContext, useContext, useReducer } from "react";

import type { FC, ReactNode } from "react";

type ResetFunction = () => void;

const ResettableJotaiStoreContext = createContext<ResetFunction>(() => {});

export const useResetJotaiStore = () => useContext(ResettableJotaiStoreContext);

export const ResettableJotaiProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [store, reset] = useReducer(() => createStore(), createStore());

	return (
		<ResettableJotaiStoreContext.Provider value={reset}>
			<Provider store={store}>{children}</Provider>
		</ResettableJotaiStoreContext.Provider>
	);
};
