"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { profileSchema } from "./schemas";
import prisma from "./db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { error } from "console";

async function getAuthUser() {
  const user = await currentUser();
  if (!user) throw new Error("You must be logged in to access this route");
  if (!user.privateMetadata.hasProfile) redirect("/profile/create");
  return user;
}

function renderError(error: unknown): { message: string } {
  console.log(error);

  return {
    message: error instanceof Error ? error.message : "An error occurred",
  };
}

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
    return renderError(error);
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

export async function fetchProfile() {
  const user = await getAuthUser();
  const profile = await prisma.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) redirect("/profile/create");

  return profile;
}

export async function updateProfileAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.safeParse(rawData);
    console.log(validatedFields);

    if (!validatedFields.success) {
      const errors = validatedFields.error.issues.map((error) => error.message);
      throw new Error(errors.join(","));
    }

    await prisma.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields.data,
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
}
