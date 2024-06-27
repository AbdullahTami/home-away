import { Button } from "@/components/ui/button";
import React from "react";

export default function HomePage() {
  return (
    <div>
      <h3 className="text-3xl">Home page</h3>
      <Button variant="outline" size="lg" className="capitalize m-8">
        Button works!
      </Button>
    </div>
  );
}
