import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Eye,
	EyeOff,
	KeyRound,
	Mail,
	Pen,
	PenOff,
	RectangleEllipsis,
	UserRound,
} from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "./type";

// === Arrow ===
cssInterop(ArrowDown, {
	className: {
		target: "style",
	},
});

cssInterop(ArrowLeft, {
	className: {
		target: "style",
	},
});

cssInterop(ArrowRight, {
	className: {
		target: "style",
	},
});

cssInterop(ArrowUp, {
	className: {
		target: "style",
	},
});

export const ArrowLeftIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowLeft size={size ?? 0} {...otherProps} />;
};

export const ArrowRightIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowRight size={size ?? 0} {...otherProps} />;
};

export const ArrowUpIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowUp size={size ?? 0} {...otherProps} />;
};

export const ArrowDownIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ArrowDown size={size ?? 0} {...otherProps} />;
};

// === Check ===
cssInterop(Check, {
	className: {
		target: "style",
	},
});

export const CheckIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Check size={size ?? 0} {...otherProps} />;
};

// === Chevron ===
cssInterop(ChevronDown, {
	className: {
		target: "style",
	},
});

cssInterop(ChevronLeft, {
	className: {
		target: "style",
	},
});

cssInterop(ChevronRight, {
	className: {
		target: "style",
	},
});

cssInterop(ChevronUp, {
	className: {
		target: "style",
	},
});

export const ChevronDownIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronDown size={size ?? 0} {...otherProps} />;
};

export const ChevronLeftIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronLeft size={size ?? 0} {...otherProps} />;
};

export const ChevronRightIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronRight size={size ?? 0} {...otherProps} />;
};

export const ChevronUpIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <ChevronUp size={size ?? 0} {...otherProps} />;
};

// === Code ===
cssInterop(RectangleEllipsis, {
	className: {
		target: "style",
	},
});

export const CodeIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <RectangleEllipsis size={size ?? 0} {...otherProps} />;
};

// === Email ===
cssInterop(Mail, {
	className: {
		target: "style",
	},
});

export const EmailIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Mail size={size ?? 0} {...otherProps} />;
};

// === Eye ===
cssInterop(Eye, {
	className: {
		target: "style",
	},
});

cssInterop(EyeOff, {
	className: {
		target: "style",
	},
});

export const EyeIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Eye size={size ?? 0} {...otherProps} />;
};

export const EyeCloseIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <EyeOff size={size ?? 0} {...otherProps} />;
};

// === Password ===
cssInterop(KeyRound, {
	className: {
		target: "style",
	},
});

export const PasswordIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <KeyRound size={size ?? 0} {...otherProps} />;
};

// === Pen ===
cssInterop(Pen, {
	className: {
		target: "style",
	},
});

cssInterop(PenOff, {
	className: {
		target: "style",
	},
});

export const PenIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Pen size={size ?? 0} {...otherProps} />;
};

export const PenOffIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <PenOff size={size ?? 0} {...otherProps} />;
};

// === User ===
cssInterop(UserRound, {
	className: {
		target: "style",
	},
});

export const UserIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <UserRound size={size ?? 0} {...otherProps} />;
};
