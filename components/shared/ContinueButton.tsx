import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function ContinueButton() {
  return (
    <Button asChild variant="outline">
      <Link href="/recruit">
        Continue <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
  );
}
