import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

export default function CreateProfilePage() {
  async function createProfileAction(formData: FormData) {
    "use server";
    const firstName = formData.get("firstName") as string;
    console.log(firstName);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">new user</h1>
      <div className="border p-8 rounded-md max-w-lg">
        <form action={createProfileAction}></form>
      </div>
    </section>
  );
}
