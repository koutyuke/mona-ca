import type { JSX, ReactNode } from "react";
import { ReactNativeModal as Modal } from "react-native-modal";

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
			isVisible={isVisible}
			hideModalContentWhileAnimating={true}
			useNativeDriver={true}
			animationIn="fadeIn"
			animationOut="fadeOut"
			style={{ margin: 0, paddingHorizontal: 32 }}
			onBackdropPress={() => {
				if (isClosable) {
					onClose();
				}
			}}
		>
			{TurnstileForm}
		</Modal>
	);
};
