import type { Meta, StoryObj } from "@storybook/react";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Line: Story = { args: { className: "h-4 w-40" } };
export const ProductCardGrid: Story = {
  render: () => (
    <div className="w-56">
      <ProductCardSkeleton view="grid" />
    </div>
  ),
};
export const ProductCardList: Story = {
  render: () => (
    <div className="w-96">
      <ProductCardSkeleton view="list" />
    </div>
  ),
};
