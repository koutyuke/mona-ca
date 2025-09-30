import { Text } from "@mona-ca/ui/native/components";

type Props = {
	actions: {
		onPressPrivacyPolicy: () => void;
		onPressTermsOfService: () => void;
	};
};

export const AgreementNoticeUI = ({ actions: { onPressPrivacyPolicy, onPressTermsOfService } }: Props) => {
	return (
		<Text size="sm" className="w-full text-slate-9">
			※ アプリのご利用を持って、
			<Text
				size="sm"
				className="text-blue-9 transition-colors active:text-blue-11"
				onPress={onPressTermsOfService}
				suppressHighlighting
			>
				利用規約
			</Text>
			および
			<Text
				size="sm"
				className="text-blue-9 transition-colors active:text-blue-11"
				onPress={onPressPrivacyPolicy}
				suppressHighlighting
			>
				プライバシーポリシー
			</Text>
			に同意したものとみなされます
		</Text>
	);
};
