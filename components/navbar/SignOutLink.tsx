"use client";
import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";

export default function SignOutLink() {
  const { toast } = useToast();
  function handleLogout() {
    toast({ description: "You have been signed out." });
  }
  return (
    <SignOutButton redirectUrl="/">
      <button className="w-full text-left" onClick={handleLogout}>
        Logout
      </button>
    </SignOutButton>
  );
}
