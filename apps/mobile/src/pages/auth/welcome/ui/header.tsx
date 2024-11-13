import { MonaCaLogo } from "@mona-ca/ui/native/brand";
import { Header } from "../../../../widgets/layout";

const WelcomePageHeader = (animatedBodyRef: Parameters<typeof Header>[0]["animatedBodyRef"]) => {
	return Header({
		animatedBodyRef,
		title: () => <MonaCaLogo className="h-6 fill-salmon-1" />,
		enableBackButton: false,
		headerClassName: "bg-mona-ca dark:bg-mona-ca",
		enableTitleAnimation: false,
	});
};

export { WelcomePageHeader };
