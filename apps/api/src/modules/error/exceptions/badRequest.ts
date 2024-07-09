class BadRequestException extends Error {
	code = "BAD_REQUEST";
	status = 400;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "The request is invalid. Please check the data you've entered.");
		this.name = name ?? "BAD_REQUEST";
	}
}

export { BadRequestException };
