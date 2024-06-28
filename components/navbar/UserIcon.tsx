import { fetchProfileImage } from "@/utils/actions";
import React from "react";
import { LuUser2 } from "react-icons/lu";

export default async function UserIcon() {
  const profileImage = await fetchProfileImage();
  return profileImage ? (
    <img
      src={profileImage}
      alt="profile image"
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <LuUser2 className="w-6 h-6 bg-primary rounded-full text-white" />
  );
}
