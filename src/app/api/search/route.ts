import { NextRequest, NextResponse } from "next/server";
import { vectorSearch } from "@/lib/vector-search";
import { generateEmbeddingForSearch } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10) || 10, 50);

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const queryVector = await generateEmbeddingForSearch(q.trim());
    const results = await vectorSearch(queryVector, limit);

    const documents = Object.values(
      results.reduce<Record<string, { chunks: typeof results; boxFileId: string }>>(
        (acc, chunk) => {
          const id = chunk.boxFileId;
          if (!acc[id]) acc[id] = { boxFileId: id, chunks: [] };
          acc[id].chunks.push(chunk);
          return acc;
        },
        {}
      )
    ).map(({ boxFileId, chunks }) => {
      const best = chunks.reduce((a, b) => (a.score > b.score ? a : b));
      return {
        id: boxFileId,
        boxFileId,
        name: best.name,
        type: best.type,
        size: best.size,
        modifiedAt: best.modifiedAt,
        downloadUrl: best.downloadUrl,
        contentSnippet: best.content?.slice(0, 300) ?? "",
        score: best.score,
      };
    });

    return NextResponse.json({
      success: true,
      results: documents,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Search failed",
      },
      { status: 500 }
    );
  }
}
