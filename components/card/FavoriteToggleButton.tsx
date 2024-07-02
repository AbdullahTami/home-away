import React from "react";
import { Button } from "../ui/button";
import { FaHeart } from "react-icons/fa";
import { auth } from "@clerk/nextjs/server";
import { CardSignInButton } from "../form/Buttons";

export default async function FavoriteToggleButton({
  propertyId,
}: {
  propertyId: string;
}) {
  const { userId } = auth();
  if (!userId) return <CardSignInButton />;
  return (
    <Button size="icon" variant="outline" className="p-2 cursor-pointer">
      <FaHeart />
    </Button>
  );
}
