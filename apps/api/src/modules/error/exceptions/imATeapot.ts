class ImATeapotException extends Error {
	code = "IM_A_TEAPOT";
	status = 418;
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(message ?? "I'm a teapot. This request cannot be handled by a coffee pot.");
		this.name = name ?? "IM_A_TEAPOT";
	}
}

export { ImATeapotException };
