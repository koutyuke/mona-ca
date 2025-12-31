import { Text } from "@mona-ca/ui/native/components";

type Props = {
	actions: {
		onPressPrivacyPolicy: () => void;
		onPressTermsOfService: () => void;
	};
};

export const AgreementNoticeUI = ({ actions: { onPressPrivacyPolicy, onPressTermsOfService } }: Props) => {
	return (
		<Text className="w-full text-slate-9" size="sm">
			※ アプリのご利用を持って、
			<Text
				className="text-blue-9 transition-colors active:text-blue-11"
				onPress={onPressTermsOfService}
				size="sm"
				suppressHighlighting
			>
				利用規約
			</Text>
			および
			<Text
				className="text-blue-9 transition-colors active:text-blue-11"
				onPress={onPressPrivacyPolicy}
				size="sm"
				suppressHighlighting
			>
				プライバシーポリシー
			</Text>
			に同意したものとみなされます。
		</Text>
	);
};
