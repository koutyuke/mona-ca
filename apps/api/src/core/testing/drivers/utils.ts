export const toRawDate = (date: Date): number => {
	return Math.floor(date.getTime() / 1000);
};

export const toRawUint8Array = (uint8Array: Uint8Array): Array<number> => {
	return Array.from(uint8Array);
};

export const toRawBoolean = (boolean: boolean): 0 | 1 => {
	return boolean ? 1 : 0;
};
