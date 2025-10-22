import type { CreateEmailOptions, CreateEmailRequestOptions, CreateEmailResponse } from "resend";
import type { IEmailGateway } from "../../../ports/gateways";

export class EmailGatewayMock implements IEmailGateway {
	public async sendEmail(
		_payload: CreateEmailOptions,
		_options?: CreateEmailRequestOptions,
	): Promise<CreateEmailResponse> {
		return {
			data: {
				id: "mock_email_id",
			},
			error: null,
		};
	}

	public async sendVerificationEmail(_to: string, _code: string): Promise<CreateEmailResponse> {
		return {
			data: {
				id: "mock_verification_email_id",
			},
			error: null,
		};
	}
}
