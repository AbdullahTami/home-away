"use server";

import { profileSchema } from "./schemas";

export async function createProfileAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.parse(rawData);
    console.log(validatedFields);
    return { message: "Profile created..." };
  } catch (error) {
    console.log(error);
    return { message: "There was an error..." };
  }
}
