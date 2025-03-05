"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      className="mb-4 cursor-pointer"
      variant="outline"
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </Button>
  );
}
