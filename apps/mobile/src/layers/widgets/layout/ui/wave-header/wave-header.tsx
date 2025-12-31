import { useNavigation } from "expo-router";
import { vh } from "../../../../shared/lib/view";
import { WaveHeaderUI } from "./wave-header.ui";

import type { JSX, ReactNode } from "react";

type Props = {
	title: string;
	subTitle?: string;

	enableBackButton?: boolean;
	backButtonLabel?: string;

	rightContents?: ReactNode;
};

export const WAVE_HEADER_HEIGHT = vh(8.5);

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
			actions={{ onBack: navigation.goBack }}
			backButtonLabel={backButtonLabel}
			enableBackButton={enableBackButton}
			rightContents={rightContents}
			subTitle={subTitle ?? ""}
			title={title}
		/>
	);
};
