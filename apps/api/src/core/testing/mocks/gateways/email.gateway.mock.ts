import type { CreateEmailOptions, CreateEmailRequestOptions, CreateEmailResponse } from "resend";
import type { IEmailGateway } from "../../../ports/gateways";

export class EmailGatewayMock implements IEmailGateway {
	public sendEmailCalls: Array<{ payload: CreateEmailOptions; options: CreateEmailRequestOptions | undefined }> = [];
	public sendVerificationEmailCalls: Array<{ email: string; code: string }> = [];

	public async sendEmail(
		payload: CreateEmailOptions,
		options?: CreateEmailRequestOptions,
	): Promise<CreateEmailResponse> {
		this.sendEmailCalls.push({ payload, options });
		return {
			data: {
				id: "mock_email_id",
			},
			error: null,
		};
	}

	public async sendVerificationEmail(to: string, code: string): Promise<CreateEmailResponse> {
		this.sendVerificationEmailCalls.push({ email: to, code });
		return {
			data: {
				id: "mock_verification_email_id",
			},
			error: null,
		};
	}
}
