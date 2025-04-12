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
	} catch (error) {
		return null;
	}
};
