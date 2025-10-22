import type { CreateEmailOptions, CreateEmailRequestOptions, CreateEmailResponse } from "resend";

export interface IEmailGateway {
	sendEmail(payload: CreateEmailOptions, options?: CreateEmailRequestOptions): Promise<CreateEmailResponse>;
	sendVerificationEmail(to: string, code: string): Promise<CreateEmailResponse>;
}
