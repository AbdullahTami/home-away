"use client";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { useProperty } from "@/utils/store";

import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods,
} from "@/utils/calender";

export default function BookingCalender() {
  const currentDate = new Date();
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const bookings = useProperty((state) => state.bookings);

  const blockedBookings = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });
  useEffect(() => {
    useProperty.setState({ range });
  }, [range]);
  return (
    <Calendar
      disabled={blockedBookings}
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
    />
  );
}
