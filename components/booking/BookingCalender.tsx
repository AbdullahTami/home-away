"use client";
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "../ui/calendar";

export default function BookingCalender() {
  const currentDate = new Date();
  const defaultSelected: DateRange = {
    from: undefined,
    to: undefined,
  };
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  return (
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
    />
  );
}
