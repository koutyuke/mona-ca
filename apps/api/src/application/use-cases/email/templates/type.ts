export type EmailTemplate = {
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string | undefined;
};
