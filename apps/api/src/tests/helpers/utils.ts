export const toRawDate = (date: Date): number => {
	return Math.floor(date.getTime() / 1000);
};

export const toRawSessionSecretHash = (sessionSecretHash: Uint8Array): Array<number> => {
	return Array.from(sessionSecretHash);
};

export const toRawBoolean = (boolean: boolean): 0 | 1 => {
	return boolean ? 1 : 0;
};
