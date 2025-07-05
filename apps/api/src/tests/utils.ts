export const toDatabaseDate = (date: Date): number => {
	return Math.floor(date.getTime() / 1000);
};

export const toDatabaseSessionSecretHash = (sessionSecretHash: Uint8Array): Array<number> => {
	return Array.from(sessionSecretHash);
};
