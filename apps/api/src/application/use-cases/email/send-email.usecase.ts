import { renderAsync } from "@react-email/render";
import type { ReactElement } from "react";
import { type CreateEmailOptions, type CreateEmailRequestOptions, type CreateEmailResponse, Resend } from "resend";
import type { ISendEmailUseCase } from "./interface/send-email.usecase.interface";
import type { EmailRenderOptions, RequireAtLeastOne } from "./type";

export class SendEmailUseCase implements ISendEmailUseCase {
	private readonly resend: Resend;
	private readonly production: boolean;

	constructor(resendAPIKey: string, production: boolean) {
		this.resend = new Resend(resendAPIKey);
		this.production = production;
	}

	public async execute(payload: CreateEmailOptions, options?: CreateEmailRequestOptions): Promise<CreateEmailResponse> {
		if (this.production) {
			return this.resend.emails.send(payload, options);
		}

		const contents = await this.render(payload);
		// biome-ignore lint/suspicious/noConsoleLog: <explanation>
		console.log(
			"[Email: Development] Email will not be sent. Email content is as follows:\n\n",
			`to: ${payload.to}\n`,
			`from: ${payload.from}\n`,
			`subject: ${payload.subject}\n`,
			`text:\n\n${contents.text}\n\n`,
			`html:\n\n${contents.html}\n\n`,
		);
		return {
			data: {
				id: "development",
			},
			error: null,
		};
	}

	private async render(
		emailRenderOptions: RequireAtLeastOne<EmailRenderOptions>,
	): Promise<{ text: string | undefined; html: string | undefined }> {
		if (emailRenderOptions.react) {
			emailRenderOptions.html = await renderAsync(emailRenderOptions.react as ReactElement);
		}

		return {
			text: emailRenderOptions.text,
			html: emailRenderOptions.html,
		};
	}
}
