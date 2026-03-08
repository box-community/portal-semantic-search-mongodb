"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContentGrid } from "./content-grid";

interface SearchResult {
  id: string;
  boxFileId: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: string;
  downloadUrl?: string;
  contentSnippet: string;
  score: number;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q || q.trim().length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setResults(data.results ?? []);
          setError(null);
        } else {
          setError(data.error ?? "Search failed");
          setResults([]);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  if (!q) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-md">Search these public domain books: A Christmas Carol, Alice's Adventures in Wonderland, Frankenstein, Peter Pan and Wuthering Heights </p>
        <p className="text-sm mt-1">
          Some queries to try: <a href="?q=children who can fly">children who can fly</a>, <a href="?q=tales of revenge">tales of revenge</a> and <a href="?q=stories of the sea">stories of the sea</a>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive font-medium">Search failed</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <ContentGrid
      results={results.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        size: r.size,
        contentSnippet: r.contentSnippet,
        score: r.score,
        downloadUrl: r.downloadUrl,
      }))}
      isLoading={isLoading}
    />
  );
}
