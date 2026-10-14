"use client";

import { Input } from "@/components/ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      label="Search products"
      hideLabel
      type="search"
      placeholder="Search products…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      leadingIcon={
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" />
          <path strokeLinecap="round" d="M17.5 17.5l-4-4" />
        </svg>
      }
    />
  );
}
