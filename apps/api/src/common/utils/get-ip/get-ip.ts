const checkHeaders = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"] as const;

export const getIP = (headers: Record<string, string | undefined> | Headers): string | null => {
	if (headers instanceof Headers) {
		for (const h of checkHeaders) {
			const header = headers.get(h);
			if (header) {
				return header;
			}
		}
		return null;
	}

	for (const h of checkHeaders) {
		const header = headers[h];
		if (header) {
			return header;
		}
	}
	return null;
};
