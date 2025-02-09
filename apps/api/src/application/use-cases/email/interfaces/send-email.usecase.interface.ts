import type { CreateEmailOptions, CreateEmailRequestOptions, CreateEmailResponse } from "resend";

export interface ISendEmailUseCase {
	execute(payload: CreateEmailOptions, options: CreateEmailRequestOptions): Promise<CreateEmailResponse>;
}
