import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { type CreateEmailOptions, type CreateEmailRequestOptions, type CreateEmailResponse, Resend } from "resend";
import type { IEmailGateway } from "../../../ports/gateways";
import { verificationEmailTemplate } from "./mail-context";
import type { EmailRenderOptions, RequireAtLeastOne } from "./type";

export class EmailGateway implements IEmailGateway {
	private readonly resend: Resend;
	private readonly production: boolean;

	constructor(production: boolean, resendAPIKey: string) {
		this.production = production;
		this.resend = new Resend(resendAPIKey);
	}

	public async sendEmail(
		payload: CreateEmailOptions,
		options?: CreateEmailRequestOptions,
	): Promise<CreateEmailResponse> {
		if (this.production) {
			return await this.resend.emails.send(payload, options);
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

	public async sendVerificationEmail(to: string, code: string): Promise<CreateEmailResponse> {
		const mailContents = verificationEmailTemplate(to, code);
		return await this.sendEmail({
			from: mailContents.from,
			to: mailContents.to,
			subject: mailContents.subject,
			text: mailContents.text,
		});
	}

	private async render(
		emailRenderOptions: RequireAtLeastOne<EmailRenderOptions>,
	): Promise<{ text: string | undefined; html: string | undefined }> {
		if (emailRenderOptions.react) {
			emailRenderOptions.html = await render(emailRenderOptions.react as ReactElement);
		}

		return {
			text: emailRenderOptions.text,
			html: emailRenderOptions.html,
		};
	}
}
