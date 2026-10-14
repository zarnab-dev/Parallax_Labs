"use client";

import { Select } from "@/components/ui/Select";
import { useCategories } from "@/lib/useCategories";
import type { ProductCategory } from "@/types/product";

interface CategoryFilterProps {
  initialCategories?: ProductCategory[];
  value: ProductCategory | "All";
  onChange: (value: ProductCategory | "All") => void;
}

export function CategoryFilter({ value, onChange, initialCategories }: CategoryFilterProps) {
  const categories = useCategories(initialCategories);

  return (
    <Select
      label="Category"
      value={value}
      onChange={(e) => onChange(e.target.value as ProductCategory | "All")}
      options={[
        { label: "All categories", value: "All" },
        ...categories.map((c) => ({ label: c, value: c })),
      ]}
      className="min-w-[10rem]"
    />
  );
}
