const checkHeaders = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"] as const;

export const getIP = (headers: Record<string, string | undefined> | Headers): string | null => {
	const isHeaderInstance = headers instanceof Headers;

	for (const h of checkHeaders) {
		const header = isHeaderInstance ? headers.get(h) : headers[h];
		if (header) {
			return header;
		}
	}
	return null;
};

export const DEVELOPMENT_IP_ADDRESS = "127.0.0.1";
