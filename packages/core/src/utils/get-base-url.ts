export const getAPIBaseURL = (production: boolean): URL => {
	return production ? new URL("https://api.mona-ca.com") : new URL("http://localhost:8787");
};

export const getWebBaseURL = (production: boolean): URL => {
	return production ? new URL("https://mona-ca.com") : new URL("http://localhost:3000");
};

export const getMobileScheme = (): URL => {
	return new URL("mona-ca://");
};
