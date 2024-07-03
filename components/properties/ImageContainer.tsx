import Image from "next/image";
import React from "react";

export default function ImageContainer({
  mainImage,
  name,
}: {
  mainImage: string;
  name: string;
}) {
  return (
    <section className="h-[300px] md:h-[500px] relative mt-8">
      <Image
        src={mainImage}
        alt={name}
        fill
        sizes="100vw"
        className="object-cover rounded"
        priority
      />
    </section>
  );
}
