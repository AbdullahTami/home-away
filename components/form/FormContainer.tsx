"use client";
import React, { PropsWithChildren, useEffect } from "react";
import { useFormState } from "react-dom";
import { useToast } from "../ui/use-toast";
import { actionFunction } from "@/utils/types";

const initialState = {
  message: "",
};

type FormContainerProps = PropsWithChildren<{
  action: actionFunction;
}>;

export default function FormContainer({
  action,
  children,
}: FormContainerProps) {
  const [state, formAction] = useFormState(action, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({ description: state.message });
    }
  }, [state, toast]);

  return <form action={formAction}>{children}</form>;
}
