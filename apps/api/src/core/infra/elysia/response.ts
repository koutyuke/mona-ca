import type { ElysiaCustomStatusResponse, redirect as elysiaRedirect } from "elysia";

export const created = () => new Response(null, { status: 201 }) as unknown as ElysiaCustomStatusResponse<201>;

export const noContent = () => new Response(null, { status: 204 }) as unknown as ElysiaCustomStatusResponse<204>;

export const redirect = (url: string, status?: 302 | 301 | 303 | 307 | 308) =>
	new Response(null, { status: status ?? 302, headers: { Location: url } }) as unknown as typeof elysiaRedirect;
