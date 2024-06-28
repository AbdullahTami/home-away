import React from "react";
import { useToast } from "../ui/use-toast";
import { SignOutButton } from "@clerk/nextjs";

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
