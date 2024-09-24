const convertRedirectableMobileScheme = (url: string | URL): string => {
	const _url = typeof url === "string" ? new URL(url).toString() : url.toString();
	return _url.replace(/\/\/\//g, "//");
};

export { convertRedirectableMobileScheme };
