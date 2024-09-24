export const validateRedirectUrl = (baseURL: URL, uri: string): URL | null => {
	try {
		const url = new URL(uri, baseURL);

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
