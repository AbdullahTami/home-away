import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type PriceInputProps = {
  defaultValue?: number;
};
const name = "price";

export default function PriceInput({ defaultValue }: PriceInputProps) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Price ($)
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        defaultValue={defaultValue || 1000}
        required
      />
    </div>
  );
}
