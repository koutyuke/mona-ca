class ResponseException extends Error {
	constructor(
		public code: string,
		public status: number,
		message: string,
	) {
		super(message);
	}
}

class BadRequestException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("BAD_REQUEST", 400, message ?? "The request is invalid. Please check the data you've entered.");
		this.name = name ?? "BAD_REQUEST";
	}
}

class UnauthorizedException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("UNAUTHORIZED", 401, message ?? "You are not authorized to access this resource.");
		this.name = name ?? "UNAUTHORIZED";
	}
}

class ForbiddenException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("FORBIDDEN", 403, message ?? "You are not allowed to access this resource. Please check your permissions.");
		this.name = name ?? "FORBIDDEN";
	}
}

class MethodNotAllowedException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("METHOD_NOT_ALLOWED", 405, message ?? "The HTTP method is not allowed. Please check the request method.");
		this.name = name ?? "METHOD_NOT_ALLOWED";
	}
}

class ConflictException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super(
			"CONFLICT",
			409,
			message ?? "The request could not be completed due to a conflict with the current state of the target resource.",
		);
		this.name = name ?? "CONFLICT";
	}
}

class ImATeapotException extends ResponseException {
	constructor(option?: { name?: string; message?: string; code?: string }) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "IM_A_TEAPOT",
			message ?? "I'm a teapot. This request cannot be handled by a coffee pot.",
			code ?? name ?? "IM_A_TEAPOT",
			418,
		);
	}
}

class TooManyRequestsException extends ResponseException {
	constructor(
		public readonly reset: number,
		option?: { name?: string; message?: string; code?: string },
	) {
		const { name, message, code } = option ?? {};
		super(
			name ?? "TOO_MANY_REQUESTS",
			message ?? "You have sent too many requests in a given amount of time.",
			code ?? name ?? "TOO_MANY_REQUESTS",
			429,
		);
	}
}

class InternalServerErrorException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("INTERNAL_SERVER_ERROR", 500, message ?? "An unexpected error occurred. Please try again later.");
		this.name = name ?? "INTERNAL_SERVER_ERROR";
	}
}

class BadGatewayException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("BAD_GATEWAY", 502, message ?? "The server received an invalid response from an upstream server.");
		this.name = name ?? "BAD_GATEWAY";
	}
}

class ServiceUnavailableException extends ResponseException {
	constructor(option?: { name?: string; message?: string }) {
		const { name, message } = option ?? {};
		super("SERVICE_UNAVAILABLE", 503, message ?? "The server is currently unavailable. Please try again later.");
		this.name = name ?? "SERVICE_UNAVAILABLE";
	}
}

export {
	ResponseException,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	MethodNotAllowedException,
	ConflictException,
	ImATeapotException,
	TooManyRequestsException,
	InternalServerErrorException,
	BadGatewayException,
	ServiceUnavailableException,
};
