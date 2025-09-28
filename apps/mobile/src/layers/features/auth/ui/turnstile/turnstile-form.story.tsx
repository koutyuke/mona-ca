import type { Meta, StoryObj } from "@storybook/react";
import { TurnstileFormUI } from "./turnstile-form.ui";
import { __DEV_TurnstileForm } from "./turnstile.dev";

const meta: Meta<typeof TurnstileFormUI> = {
	title: "Features/Auth/TurnstileForm",
	component: TurnstileFormUI,
};

export default meta;

type Story = StoryObj<typeof TurnstileFormUI>;

export const Default: Story = {
	args: __DEV_TurnstileForm.props.default(),
};
