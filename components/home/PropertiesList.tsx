import { type PropertyCardProps } from "@/utils/types";
import React from "react";
import PropertyCard from "../card/PropertyCard";

export default function PropertiesList({
  properties,
}: {
  properties: PropertyCardProps[];
}) {
  return (
    <section className="mt-4 gap-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </section>
  );
}
