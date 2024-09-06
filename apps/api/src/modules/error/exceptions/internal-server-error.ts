class InternalServerErrorException extends Error {
	code = "INTERNAL_SERVER_ERROR";
	status = 500;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "An internal server error has occurred. Please contact the administrator.");
		this.name = name ?? "INTERNAL_SERVER_ERROR";
	}
}

export { InternalServerErrorException };
