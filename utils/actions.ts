"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  createReviewSchema,
  imageSchema,
  profileSchema,
  propertySchema,
  validateWithZodSchema,
} from "./schemas";
import prisma from "./db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadImage } from "./supabase";
import { calculateTotals } from "./calculateTotals";
import { formatDate } from "./format";

//! Auth Guard Function
async function getAuthUser() {
  const user = await currentUser();
  if (!user) throw new Error("You must be logged in to access this route");
  if (!user.privateMetadata.hasProfile) redirect("/profile/create");
  return user;
}

//! Admin Guard Function
async function getAdminUser() {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect("/");
  return user;
}

function renderError(error: unknown): { message: string } {
  console.log(error);

  return {
    message: error instanceof Error ? error.message : "An error occurred",
  };
}

//! Profile Creation Action
export async function createProfileAction(prevState: any, formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Please login to create a profile");
    console.log(user);

    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);
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

//! Image Fetching
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

//! Profile Update
export async function updateProfileAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);
    await prisma.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
}

//! Profile Image Update
export async function updateProfileImageAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  const user = await getAuthUser();

  try {
    const image = formData.get("image") as string;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await prisma.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath("/profile");
    return { message: "Profile image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
}

//! Property creation action
export async function createPropertyAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    await prisma.property.create({
      data: {
        ...validatedFields,
        image: fullPath,
        profileId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
}

//! Properties fetching
export async function fetchProperties({
  search = "",
  category,
}: {
  search?: string;
  category?: string;
}) {
  const properties = await prisma.property.findMany({
    where: {
      // If not defined, all categories are fetched
      category,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      tagline: true,
      country: true,
      price: true,
      image: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return properties;
}

//! Fetching favorite
export async function fetchFavoritesId({ propertyId }: { propertyId: string }) {
  const user = await getAuthUser();
  const favorite = await prisma.favorite.findFirst({
    where: {
      propertyId,
      profileId: user.id,
    },
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
}

//! toggling favorite
export async function toggleFavoriteAction(prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) {
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await prisma.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await prisma.favorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? "Removed form Faves" : "Added to Faves" };
  } catch (error) {
    renderError(error);
  }
}

//! Fetching favorites
export async function fetchFavorites() {
  const user = await getAuthUser();
  const favorites = await prisma.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          country: true,
          price: true,
          image: true,
        },
      },
    },
  });
  return favorites.map((favorite) => favorite.property);
}

//! Fetching property details
export async function fetchPropertyDetails(id: string) {
  return prisma.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
      bookings: {
        select: {
          checkIn: true,
          checkOut: true,
        },
      },
    },
  });
}

//! Create review action
export async function createReviewAction(prevState: any, formData: FormData) {
  try {
    const user = await getAuthUser();
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(createReviewSchema, rawData);
    await prisma.review.create({
      data: {
        profileId: user.id,
        ...validatedFields,
      },
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: "Review submitted successfully" };
  } catch (error) {
    renderError(error);
  }
}
//! Fetch single property reviews
export async function fetchPropertyReviews(propertyId: string) {
  const reviews = prisma.review.findMany({
    where: {
      propertyId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      profile: {
        select: {
          firstName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return reviews;
}
//! Fetch single property reviews by user
export async function fetchPropertyReviewsByUser() {
  const user = await getAuthUser();
  const reviews = await prisma.review.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  return reviews;
}
//! Delete review action
export async function deleteReviewAction(prevState: { reviewId: string }) {
  const { reviewId } = prevState;
  const user = await getAuthUser();
  try {
    await prisma.review.delete({
      where: { id: reviewId, profileId: user.id },
    });
    revalidatePath("/reviews");
    return { message: "Review deleted successfully" };
  } catch (error) {
    renderError(error);
  }
}

//! Fetch property rating
export async function fetchPropertyRating(propertyId: string) {
  const result = await prisma.review.groupBy({
    by: ["propertyId"],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      propertyId,
    },
  });
  // console.log(result);

  return {
    rating: result[0]?._avg.rating?.toFixed() ?? 0,
    count: result[0]?._count.rating?.toFixed() ?? 0,
  };
}

//! Find existing user
export async function findExistingReview(userId: string, propertyId: string) {
  return prisma.review.findFirst({
    where: {
      profileId: userId,
      propertyId: propertyId,
    },
  });
}

//! Booking creation action
export async function createBookingAction(prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) {
  const user = await getAuthUser();
  await prisma.booking.deleteMany({
    where: {
      profileId: user.id,
      paymentStatus: false,
    },
  });
  let bookingId: null | string = null;
  const { propertyId, checkIn, checkOut } = prevState;
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: { price: true },
  });
  if (!property) return { message: "Property not found" };

  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property?.price,
  });
  try {
    const booking = await prisma.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal,
        totalNights,
        profileId: user.id,
        propertyId,
      },
    });

    bookingId = booking.id;
  } catch (error) {
    renderError(error);
  }

  redirect(`/checkout?bookingId=${bookingId}`);
}

//! Booking fetching action
export async function fetchBookings() {
  const user = await getAuthUser();
  const bookings = await prisma.booking.findMany({
    where: {
      profileId: user.id,
      paymentStatus: true,
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return bookings;
}

//! Booking deletion action
export async function deleteBookingAction(prevState: { bookingId: string }) {
  const { bookingId } = prevState;

  const user = await getAuthUser();

  try {
    const result = await prisma.booking.delete({
      where: {
        id: bookingId,
        profileId: user.id,
      },
    });
    revalidatePath("/bookings");
    return { message: "Booking deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
}

//! Rentals fetching
export async function fetchRentals() {
  const user = await getAuthUser();
  const rentals = await prisma.property.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  const rentalsWithBookingSums = await Promise.all(
    rentals.map(async (rental) => {
      const totalNightSum = await prisma.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          totalNights: true,
        },
      });
      const orderTotalSum = await prisma.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          orderTotal: true,
        },
      });
      return {
        ...rental,
        totalNightsSum: totalNightSum._sum.totalNights,
        orderTotalSum: orderTotalSum._sum.orderTotal,
      };
    })
  );
  return rentalsWithBookingSums;
}

//! Rental deletion action
export async function deleteRentalAction(prevState: { propertyId: string }) {
  const { propertyId } = prevState;
  const user = await getAuthUser();

  try {
    await prisma.property.delete({
      where: {
        id: propertyId,
        profileId: user.id,
      },
    });
    revalidatePath("/rentals");
    return { message: "Rental deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
}
//! Rental details fetch action
export async function fetchRentalDetails(propertyId: string) {
  const user = await getAuthUser();
  return prisma.property.findUnique({
    where: { id: propertyId, profileId: user.id },
  });
}
//! Property update action
export async function updatePropertyAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    // await prisma.property.update({
    //   where: { id: propertyId, profileId: user.id },
    // });
    await prisma.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Update Successful" };
  } catch (error) {
    return renderError(error);
  }
}
//! Property image update action
export async function updatePropertyImageAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);
    await prisma.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Property Image Updated Successfully" };
  } catch (error) {
    return renderError(error);
  }
}

export async function fetchReservations() {
  const user = await getAuthUser();

  const reservations = await prisma.booking.findMany({
    where: {
      paymentStatus: true,
      property: {
        profileId: user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      property: {
        select: { id: true, name: true, price: true, country: true },
      },
    },
  });
  return reservations;
}

export async function fetchStats() {
  await getAdminUser();

  const usersCount = await prisma.profile.count();
  const propertiesCount = await prisma.property.count();
  const bookingsCount = await prisma.booking.count({
    where: { paymentStatus: true },
  });

  return { usersCount, propertiesCount, bookingsCount };
}

export async function fetchChartsData() {
  await getAdminUser();
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  const sixMonthsAgo = date;

  const bookings = await prisma.booking.findMany({
    where: {
      paymentStatus: true,
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const bookingsPerMonth = bookings.reduce((total, current) => {
    const date = formatDate(current.createdAt, true);
    const existingEntry = total.find((entry) => entry.date === date);
    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      total.push({ date, count: 1 });
    }
    return total;
  }, [] as Array<{ date: string; count: number }>);
  return bookingsPerMonth;
}
