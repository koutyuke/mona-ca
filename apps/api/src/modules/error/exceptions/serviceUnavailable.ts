class ServiceUnavailableException extends Error {
	code = "SERVICE_UNAVAILABLE";
	status = 503;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "The server is currently unavailable (because it is overloaded or down for maintenance).");
		this.name = name ?? "SERVICE_UNAVAILABLE";
	}
}

export { ServiceUnavailableException };
