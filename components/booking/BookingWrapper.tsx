"use client";
import React, { useEffect } from "react";
import { useProperty } from "@/utils/store";
import { type Booking } from "@/utils/types";
import BookingCalender from "./BookingCalender";
import BookingContainer from "./BookingContainer";

type BookingWrapperProps = {
  propertyId: string;
  price: number;
  bookings: Booking[];
};

export default function BookingWrapper({
  price,
  propertyId,
  bookings,
}: BookingWrapperProps) {
  useEffect(() => {
    useProperty.setState({ propertyId, price, bookings });
  }, []);
  return (
    <>
      <BookingCalender />
      <BookingContainer />
    </>
  );
}
