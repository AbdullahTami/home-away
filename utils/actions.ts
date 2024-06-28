"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { profileSchema } from "./schemas";
import prisma from "./db";
import { redirect } from "next/navigation";

export async function createProfileAction(prevState: any, formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Please login to create a profile");
    console.log(user);

    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.parse(rawData);
    await prisma.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl ?? "",
        ...validatedFields,
      },
    });
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      message: error instanceof Error ? error.message : "An error occurred",
    };
  }
  redirect("/");
}

export async function fetchProfileImage() {
  const user = await currentUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      profileImage: true,
    },
  });
  return profile?.profileImage;
}
