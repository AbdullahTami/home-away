"use client";
import React, { useState } from "react";
import Title from "./Title";
import { Button } from "../ui/button";

export default function Description({ description }: { description: string }) {
  const [isFullDescriptionShown, setIsFullDescriptionShown] = useState(false);

  const words = description.split(" ");
  const isLongDescription = words.length > 100;

  function toggleDescription() {
    setIsFullDescriptionShown(!isFullDescriptionShown);
  }

  const displayedDescription =
    isLongDescription && !isFullDescriptionShown
      ? words.slice(0, 100).join(" ") + "..."
      : description;

  return (
    <article className="mt-4">
      <Title text="Description" />
      <p className="text-muted-foreground font-light leading-loose">
        {displayedDescription}
      </p>
      {isLongDescription && (
        <Button variant="link" className="pl-0" onClick={toggleDescription}>
          {isFullDescriptionShown ? "SHow less" : "Show more"}
        </Button>
      )}
    </article>
  );
}
