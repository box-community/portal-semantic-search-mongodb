"use client";

import { ContentCard } from "./content-card";
import type { ContentCardProps } from "./content-card";

interface ContentGridProps {
  results: ContentCardProps[];
  isLoading?: boolean;
}

function ContentGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContentGrid({ results, isLoading }: ContentGridProps) {
  if (isLoading) {
    return <ContentGridSkeleton />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No results found</p>
        <p className="text-sm mt-1">
          Try a different search or run <code className="rounded bg-muted px-1">npm run sync</code> to index content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((item) => (
        <ContentCard key={item.id} {...item} />
      ))}
    </div>
  );
}
