import { ReactNativeModal as Modal } from "react-native-modal";

import type { JSX, ReactNode } from "react";

type Props = {
	isVisible: boolean;
	isClosable: boolean;
	actions: {
		onClose: () => void;
	};
	slots: {
		TurnstileForm: ReactNode;
	};
};

export const TurnstileModalUI = ({
	isVisible,
	isClosable,
	actions: { onClose },
	slots: { TurnstileForm },
}: Props): JSX.Element => {
	return (
		<Modal
			animationIn="fadeIn"
			animationOut="fadeOut"
			hideModalContentWhileAnimating={true}
			isVisible={isVisible}
			onBackdropPress={() => {
				if (isClosable) {
					onClose();
				}
			}}
			style={{ margin: 0, paddingHorizontal: 32 }}
			useNativeDriver={true}
		>
			{TurnstileForm}
		</Modal>
	);
};
