class ConflictException extends Error {
	code = "CONFLICT";
	status = 409;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(
			message ?? "The request could not be completed due to a conflict with the current state of the target resource.",
		);
		this.name = name ?? "CONFLICT";
	}
}

export { ConflictException };
