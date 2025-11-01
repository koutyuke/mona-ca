import type { ElysiaCustomStatusResponse } from "elysia";

export const created = () => new Response(null, { status: 201 }) as unknown as ElysiaCustomStatusResponse<201, null>;

export const noContent = () => new Response(null, { status: 204 }) as unknown as ElysiaCustomStatusResponse<204, null>;

export const redirect = <T extends 301 | 302 | 303 | 307 | 308 = 302>(url: string, status: T = 302 as T) =>
	new Response(null, { status: status ?? 302, headers: { Location: url } }) as unknown as ElysiaCustomStatusResponse<
		T,
		null
	>;
