class NotImplementedException extends Error {
	code = "NOT_IMPLEMENTED";
	status = 501;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "The requested functionality is not implemented.");
		this.name = name ?? "NOT_IMPLEMENTED";
	}
}

export { NotImplementedException };
