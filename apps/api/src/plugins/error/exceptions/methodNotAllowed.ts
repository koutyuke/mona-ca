class MethodNotAllowedException extends Error {
	code = "METHOD_NOT_ALLOWED";
	status = 405;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "The HTTP method is not allowed. Please check the request method.");
		this.name = name ?? "METHOD_NOT_ALLOWED";
	}
}

export { MethodNotAllowedException };
