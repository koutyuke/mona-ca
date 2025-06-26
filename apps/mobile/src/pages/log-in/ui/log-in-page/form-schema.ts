import * as v from "valibot";

export const formSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty("メールアドレスを入力してください")),
	password: v.pipe(v.string(), v.nonEmpty("パスワードを入力してください")),
});

export type FormSchema = v.InferOutput<typeof formSchema>;
