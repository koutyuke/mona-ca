import NetInfo from "@react-native-community/netinfo";
import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";

export const isOnlineAtom = atom<boolean>(true);

export const useNetworkStatus = () => {
	const setIsOnline = useSetAtom(isOnlineAtom);

	useEffect(() => {
		const unsub = NetInfo.addEventListener(state => {
			const reachable = state.isInternetReachable ?? state.isConnected ?? false;
			setIsOnline(!!reachable);
		});
		return () => unsub();
	}, [setIsOnline]);
};
