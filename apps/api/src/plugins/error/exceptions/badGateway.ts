class BadGatewayException extends Error {
	code = "BAD_GATEWAY";
	status = 502;
	constructor(option?: { name?: string; message?: string }) {
		super(option?.message ?? "The upstream server returned an invalid response.");
		this.name = option?.name ?? "BAD_GATEWAY";
	}
}

export { BadGatewayException };
