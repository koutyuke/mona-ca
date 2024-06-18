class UnauthorizedException extends Error {
	code = "UNAUTHORIZED";
	status = 401;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "You are not authorized to access this resource.");
		this.name = name ?? "UNAUTHORIZED";
	}
}

export { UnauthorizedException };
