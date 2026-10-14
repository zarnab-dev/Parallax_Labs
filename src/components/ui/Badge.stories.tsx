import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "New" },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "success", "warning", "danger", "brand"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { tone: "neutral" } };
export const Success: Story = { args: { tone: "success", children: "In stock" } };
export const Danger: Story = { args: { tone: "danger", children: "Out of stock" } };
export const Brand: Story = { args: { tone: "brand", children: "New" } };
