"use client";
import { useProperty } from "@/utils/store";
import { SignInButton, useAuth } from "@clerk/nextjs";
import React from "react";
import { Button } from "../ui/button";
import FormContainer from "../form/FormContainer";
import { SubmitButton } from "../form/Buttons";
import { createBookingAction } from "@/utils/actions";

export default function ConfirmBooking() {
  const { userId } = useAuth();
  const { propertyId, range } = useProperty((state) => state);
  const checkIn = range?.from as Date;
  const checkOut = range?.to as Date;
  const createBooking = createBookingAction.bind(null, {
    propertyId,
    checkIn,
    checkOut,
  });
  return !userId ? (
    <SignInButton mode="modal">
      <Button type="button" className="w-full">
        Sign In to Complete Booking
      </Button>
    </SignInButton>
  ) : (
    <section>
      <FormContainer action={createBooking}>
        <SubmitButton text="Reserve" className="w-full" />
      </FormContainer>
    </section>
  );
}
