import EmptyList from "@/components/home/EmptyList";
import PropertiesList from "@/components/home/PropertiesList";
import { fetchFavorites } from "@/utils/actions";
import React from "react";

export default async function FavoritesPage() {
  const favorites = await fetchFavorites();

  return !favorites.length ? (
    <EmptyList />
  ) : (
    <PropertiesList properties={favorites} />
  );
}
