class ForbiddenException extends Error {
	code = "FORBIDDEN";
	status = 403;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "You do not have access rights to this resource. Please check your permissions.");
		this.name = name ?? "FORBIDDEN";
	}
}

export { ForbiddenException };
