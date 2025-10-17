export type EmailContext = {
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string | undefined;
};
