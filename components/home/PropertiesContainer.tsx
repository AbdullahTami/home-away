import { fetchProperties } from "@/utils/actions";
import { PropertyCardProps } from "@/utils/types";
import React from "react";
import EmptyList from "./EmptyList";
import PropertiesList from "./PropertiesList";

export default async function PropertiesContainer({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  const properties: PropertyCardProps[] = await fetchProperties({
    category,
    search,
  });
  return !properties.length ? (
    <EmptyList
      heading="No results"
      message="Try changing or removing some of your filters"
      btnText="Clear filters"
    />
  ) : (
    <PropertiesList properties={properties} />
  );
}
