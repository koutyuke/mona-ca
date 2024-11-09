export const readBearerToken = (authorizationHeader: string): string | null => {
	const [authScheme, token] = authorizationHeader.split(" ") as [string, string | undefined];
	if (authScheme !== "Bearer" || !token) {
		return null;
	}
	return token;
};
