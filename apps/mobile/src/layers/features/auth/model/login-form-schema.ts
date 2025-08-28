import * as v from "valibot";

export const loginFormSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty("メールアドレスを入力してください")),
	password: v.pipe(v.string(), v.nonEmpty("パスワードを入力してください")),
});

export type LoginFormSchema = v.InferOutput<typeof loginFormSchema>;
