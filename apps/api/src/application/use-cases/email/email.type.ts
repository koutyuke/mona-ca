import type { ReactNode } from "react";

export interface EmailRenderOptions {
	/**
	 * The React component used to write the message.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	react: ReactNode;
	/**
	 * The HTML version of the message.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	html: string;
	/**
	 * The plain text version of the message.
	 *
	 * @link https://resend.com/docs/api-reference/emails/send-email#body-parameters
	 */
	text: string;
}

export type RequireAtLeastOne<T> = {
	[K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];
