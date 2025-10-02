import * as v from "valibot";

export const signupFormSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty("メールアドレスを入力してください"), v.email("メールアドレスが不正です")),
	password: v.pipe(
		v.string(),
		v.nonEmpty("パスワードを入力してください"),
		v.minLength(8, "パスワードは8文字以上で入力してください"),
	),
	name: v.pipe(v.string(), v.nonEmpty("名前を入力してください")),
	gender: v.picklist(["man", "woman"], "性別を選択してください"),
});

export type SignupFormSchema = v.InferOutput<typeof signupFormSchema>;
