export const getAPIBaseUrl = (production: boolean): URL => {
	return production ? new URL("https://api.mona-ca.com") : new URL("http://localhost:8787");
};

export const getWebBaseUrl = (production: boolean): URL => {
	return production ? new URL("https://mona-ca.com") : new URL("http://localhost:3000");
};

export const getMobileScheme = (): URL => {
	return new URL("mona-ca://");
};
