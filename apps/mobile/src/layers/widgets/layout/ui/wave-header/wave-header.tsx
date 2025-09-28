import { useNavigation } from "expo-router";
import type { JSX, ReactNode } from "react";
import { vh } from "../../../../shared/lib/view";
import { WaveHeaderUI } from "./wave-header.ui";

type Props = {
	title: string;
	subTitle?: string;

	enableBackButton?: boolean;
	backButtonLabel?: string;

	rightContents?: ReactNode;
};

export const WAVE_HEADER_HEIGHT = 44 + vh(8.5);

export const WaveHeader = ({
	title,
	subTitle,
	enableBackButton = true,
	backButtonLabel = "戻る",
	rightContents,
}: Props): JSX.Element => {
	const navigation = useNavigation();

	return (
		<WaveHeaderUI
			title={title}
			subTitle={subTitle ?? ""}
			enableBackButton={enableBackButton}
			backButtonLabel={backButtonLabel}
			rightContents={rightContents}
			actions={{ onBack: navigation.goBack }}
		/>
	);
};
