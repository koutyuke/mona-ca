class ResponseException extends Error {
	constructor(
		name: string,
		message: string,
		public code: string,
		public status: number,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		public additional?: Record<string, any>,
	) {
		super(message);
		this.name = name;
	}
}

class BadRequestException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "BAD_REQUEST",
			message ?? "The request is invalid. Please check the data you've entered.",
			code ?? name ?? "BAD_REQUEST",
			400,
			additional,
		);
	}
}

class UnauthorizedException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "UNAUTHORIZED",
			message ?? "You are not authorized to access this resource.",
			code ?? name ?? "UNAUTHORIZED",
			401,
			additional,
		);
	}
}

class ForbiddenException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "FORBIDDEN",
			message ?? "You are not allowed to access this resource. Please check your permissions.",
			code ?? name ?? "FORBIDDEN",
			403,
			additional,
		);
	}
}

class NotFoundException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "NOT_FOUND",
			message ?? "The requested resource was not found.",
			code ?? name ?? "NOT_FOUND",
			404,
			additional,
		);
	}
}

class MethodNotAllowedException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "METHOD_NOT_ALLOWED",
			message ?? "The HTTP method is not allowed. Please check the request method.",
			code ?? name ?? "METHOD_NOT_ALLOWED",
			405,
			additional,
		);
	}
}

class ConflictException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "CONFLICT",
			message ?? "The request could not be completed due to a conflict with the current state of the target resource.",
			code ?? name ?? "CONFLICT",
			409,
			additional,
		);
	}
}

class ImATeapotException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "IM_A_TEAPOT",
			message ?? "I'm a teapot. This request cannot be handled by a coffee pot.",
			code ?? name ?? "IM_A_TEAPOT",
			418,
			additional,
		);
	}
}

class TooManyRequestsException extends ResponseException {
	constructor(
		public readonly reset: number,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> },
	) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "TOO_MANY_REQUESTS",
			message ?? "You have sent too many requests in a given amount of time.",
			code ?? name ?? "TOO_MANY_REQUESTS",
			429,
			additional,
		);
	}
}

class InternalServerErrorException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "INTERNAL_SERVER_ERROR",
			message ?? "An unexpected error occurred. Please try again later.",
			code ?? name ?? "INTERNAL_SERVER_ERROR",
			500,
			additional,
		);
	}
}

class BadGatewayException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "BAD_GATEWAY",
			message ?? "The server received an invalid response from an upstream server.",
			code ?? name ?? "BAD_GATEWAY",
			502,
			additional,
		);
	}
}

class ServiceUnavailableException extends ResponseException {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(option?: { name?: string; message?: string; code?: string; additional?: Record<string, any> }) {
		const { name, message, code, additional } = option ?? {};
		super(
			name ?? "SERVICE_UNAVAILABLE",
			message ?? "The server is currently unavailable. Please try again later.",
			code ?? name ?? "SERVICE_UNAVAILABLE",
			503,
			additional,
		);
	}
}

export {
	ResponseException,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	NotFoundException,
	MethodNotAllowedException,
	ConflictException,
	ImATeapotException,
	TooManyRequestsException,
	InternalServerErrorException,
	BadGatewayException,
	ServiceUnavailableException,
};
