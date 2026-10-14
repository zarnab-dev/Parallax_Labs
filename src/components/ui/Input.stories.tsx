import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  args: { label: "Email address", placeholder: "you@example.com" },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const WithError: Story = {
  args: { error: "Please enter a valid email address." },
};
export const HiddenLabel: Story = {
  args: { hideLabel: true, placeholder: "Search products…" },
};
