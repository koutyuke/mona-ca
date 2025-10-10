export const foo = (d: Date): Date => {
	return new Date(Math.floor(d.getTime() / 1000) * 1000);
};
