"use client";

import { SearchBar } from "./search-bar";
import { SearchResults } from "./search-results";

export function SearchSection() {
  return (
    <>
      <SearchBar className="w-full" />
      <div className="w-full mt-4">
        <SearchResults />
      </div>
    </>
  );
}
