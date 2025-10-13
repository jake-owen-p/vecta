"use client";

import { ToggleGroup, ToggleGroupItem } from "../../_components/ui/toggle-group";
import type { Audience } from "./steps";

interface AudienceToggleProps {
  readonly value: Audience;
  readonly onChange: (value: Audience) => void;
}

export const AudienceToggle = ({ value, onChange }: AudienceToggleProps) => {
  return (
    <ToggleGroup
      type="single"
      size="lg"
      value={value}
      onValueChange={(next) => {
        if (next === "business" || next === "engineer") {
          onChange(next);
        }
      }}
      className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
    >
      <ToggleGroupItem
        value="business"
        className="rounded-full px-6 py-2 text-sm font-semibold data-[state=on]:bg-[#FF3600] data-[state=on]:text-black"
        aria-label="Show process for businesses"
      >
        Businesses
      </ToggleGroupItem>
      <ToggleGroupItem
        value="engineer"
        className="rounded-full px-6 py-2 text-sm font-semibold data-[state=on]:bg-[#FF3600] data-[state=on]:text-black"
        aria-label="Show process for engineers"
      >
        Engineers
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
