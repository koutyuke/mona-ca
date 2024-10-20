import { Header, calculateHeaderAnimationTriggerPointOfPageWaveTitle } from "@mobile/widgets/layout";
import { pageTitle } from "./page-title";

const SignUpWithEmailPageHeader = (animatedBodyRef: Parameters<typeof Header>[0]["animatedBodyRef"]) => {
	return Header({
		animatedBodyRef,
		title: "Email",
		enableBackButton: true,
		headerClassName: "bg-mona-ca dark:bg-mona-ca",
		backButtonColorClassName: "color-slate-1 group-active:color-slate-4",
		titleColorClassName: "color-slate-1",
		titleAnimationTriggerPoint: calculateHeaderAnimationTriggerPointOfPageWaveTitle(pageTitle.length),
	});
};

export { SignUpWithEmailPageHeader };
