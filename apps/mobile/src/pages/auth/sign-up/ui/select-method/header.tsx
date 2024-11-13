import { Header, calculateHeaderAnimationTriggerPointOfPageWaveTitle } from "../../../../../widgets/layout";
import { pageTitle } from "./page-title";

const SignUpSelectMethodPageHeader = (animatedBodyRef: Parameters<typeof Header>[0]["animatedBodyRef"]) =>
	Header({
		animatedBodyRef,
		title: "Sign Up",
		enableBackButton: true,
		headerClassName: "bg-mona-ca dark:bg-mona-ca",
		backButtonColorClassName: "color-slate-1 group-active:color-slate-4",
		titleColorClassName: "color-slate-1",
		titleAnimationTriggerPoint: calculateHeaderAnimationTriggerPointOfPageWaveTitle(pageTitle.length),
	});

export { SignUpSelectMethodPageHeader };
