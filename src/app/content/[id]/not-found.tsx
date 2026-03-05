import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContentNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Content not found</h1>
        <p className="text-muted-foreground">
          The requested content may have been removed or does not exist.
        </p>
        <Button asChild>
          <Link href="/">Back to search</Link>
        </Button>
      </div>
    </div>
  );
}
