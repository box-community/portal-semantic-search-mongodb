import { Suspense } from "react";
import { SearchSection } from "@/components/search-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold tracking-tight">Box Content Portal</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="w-full max-w-2xl text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Semantic Search Your Content
            </h2>
            <p className="text-muted-foreground">
              Find documents by meaning, not just keywords. Powered by Box and
              MongoDB Atlas Vector Search.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="w-full max-w-2xl h-12 rounded-md bg-muted animate-pulse" />
            }
          >
            <SearchSection />
          </Suspense>
        </div>
      </main>

      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <a href="https://github.com/box-community/portal-semantic-search-mongodb" target="_blank" rel="noopener noreferrer">Source Code</a>
          &nbsp;·&nbsp; <a href="https://account.box.com/signup/developer" target="_blank">Signup for Box for Free</a>
        </div>
      </footer>
    </div>
  );
}
