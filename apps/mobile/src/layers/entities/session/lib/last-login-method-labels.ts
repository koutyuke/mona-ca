import type { LoginMethod } from "../model/last-login-method";

export const lastLoginMethodLabels: Record<LoginMethod, string> = {
	email: "メールアドレス",
	google: "Google",
	discord: "Discord",
};
