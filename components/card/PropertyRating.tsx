import { fetchPropertyRating } from "@/utils/actions";
import React from "react";
import { FaStar } from "react-icons/fa";
export default async function PropertyRating({
  propertyId,
  inPage,
}: {
  propertyId: string;
  inPage: boolean;
}) {
  // temp
  const { rating, count } = await fetchPropertyRating(propertyId);
  if (+count === 0) return null;
  const className = `flex gap-1 items-center ${inPage ? "text-md" : "text-xs"}`;
  const countText = +count > 1 ? "reviews" : "review";
  const countValue = `(${count}) ${inPage ? countText : ""}`;
  return (
    <span className={className}>
      <FaStar className="h-2 w-3" />
      {rating} {countValue}
    </span>
  );
}
