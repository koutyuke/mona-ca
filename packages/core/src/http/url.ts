export const getAPIBaseURL = (production: boolean): URL => {
	return production ? new URL("https://api.mona-ca.com") : new URL("http://localhost:8787");
};

export const getWebBaseURL = (production: boolean): URL => {
	return production ? new URL("https://mona-ca.com") : new URL("http://localhost:3000");
};

export const getMobileScheme = (_production: boolean): URL => {
	return new URL("mona-ca://");
};

export const validateRedirectURL = (baseURL: URL, targetURL: string): URL | null => {
	try {
		const url = new URL(targetURL, baseURL);

		if (
			(url.origin === "null" && baseURL.origin === "null" && url.protocol === baseURL.protocol) ||
			(url.origin === baseURL.origin && baseURL.origin !== "null")
		) {
			return url;
		}

		return null;
	} catch (_error) {
		return null;
	}
};

export const normalizeRedirectableMobileScheme = (url: URL): string => {
	return url.toString().replace(/\/\/\//g, "//");
};
