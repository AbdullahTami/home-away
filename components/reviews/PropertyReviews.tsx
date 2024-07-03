import { fetchPropertyReviews } from "@/utils/actions";
import React from "react";
import Title from "../properties/Title";
import ReviewCard from "./ReviewCard";

export default async function PropertyReviews({
  propertyId,
}: {
  propertyId: string;
}) {
  const reviews = await fetchPropertyReviews(propertyId);
  return !reviews.length ? null : (
    <div className="mt-8">
      <Title text="Reviews" />
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {reviews.map((review) => {
          const { comment, rating } = review;
          const { profileImage, firstName } = review.profile;
          const reviewInfo = {
            comment,
            rating,
            name: firstName,
            image: profileImage,
          };

          return <ReviewCard key={review.id} reviewInfo={reviewInfo} />;
        })}
      </div>
    </div>
  );
}
