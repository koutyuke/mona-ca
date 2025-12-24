export const withBearer = (token: string): string => {
	return `Bearer ${token}`;
};

export const readBearerToken = (authorizationHeader: string): string | null => {
	const space = authorizationHeader.indexOf(" ");
	if (space <= 0 || space === authorizationHeader.length - 1) return null;
	const authScheme = authorizationHeader.slice(0, space);
	const token = authorizationHeader.slice(space + 1);
	if (authScheme !== "Bearer") return null;
	return token;
};
