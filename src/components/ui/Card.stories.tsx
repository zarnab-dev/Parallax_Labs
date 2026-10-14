import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody } from "@/components/ui/Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-64">
      <CardBody>
        <p className="font-medium">Card title</p>
        <p className="text-sm text-gray-500">Supporting card content goes here.</p>
      </CardBody>
    </Card>
  ),
};
