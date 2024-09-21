import type { CreateEmailOptions, CreateEmailRequestOptions, CreateEmailResponse } from "resend";

export interface IEmailUseCase {
	sendEmail(payload: CreateEmailOptions, options: CreateEmailRequestOptions): Promise<CreateEmailResponse>;
}
