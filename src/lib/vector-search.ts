import { getDb } from "./mongodb";
import type { ContentChunk } from "@/types/content";

const VECTOR_INDEX_NAME = "content_vector_index";
const EMBEDDING_DIMENSIONS = 1536;

export interface VectorSearchResult {
  _id: string;
  boxFileId: string;
  boxFolderId: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: Date;
  downloadUrl?: string;
  chunkIndex: number;
  totalChunks: number;
  content: string;
  score: number;
}

export async function vectorSearch(
  queryVector: number[],
  limit = 10,
  filter?: Record<string, unknown>
): Promise<VectorSearchResult[]> {
  const database = await getDb();
  const collection = database.collection<ContentChunk>("content");

  const pipeline = [
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector,
        limit: limit * 15,
        numCandidates: limit * 50,
        ...(filter && { filter }),
      },
    },
    {
      $project: {
        _id: 1,
        boxFileId: 1,
        boxFolderId: 1,
        name: 1,
        type: 1,
        size: 1,
        modifiedAt: 1,
        downloadUrl: 1,
        chunkIndex: 1,
        totalChunks: 1,
        content: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
  ];

  const results = await collection.aggregate<VectorSearchResult>(pipeline).toArray();
  console.log("Number of results:", results.length);
  //console.log("Vector Search Results:", results);

  return results
    // remove results with score less than 0.6
    .filter((r) => r.score > 0.6)
    .map((r) => ({
    ...r,
    _id: r._id?.toString() ?? "",
    modifiedAt: r.modifiedAt instanceof Date ? r.modifiedAt : new Date(r.modifiedAt),
  }));
}

export async function ensureVectorIndex(): Promise<void> {
  const database = await getDb();
  const collection = database.collection("content");

  try {
    const existingIndexes: { name?: string }[] = [];
    for await (const idx of collection.listSearchIndexes()) {
      existingIndexes.push(idx);
    }
    const hasVectorIndex = existingIndexes.some((i) => i.name === VECTOR_INDEX_NAME);
    if (hasVectorIndex) return;

    await collection.createSearchIndex({
      name: VECTOR_INDEX_NAME,
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: EMBEDDING_DIMENSIONS,
            similarity: "cosine",
          },
          {
            type: "filter",
            path: "type",
          },
        ],
      },
    });
  } catch (err) {
    console.warn(
      "Vector index creation may require Atlas cluster. Create manually in Atlas UI if needed:",
      err
    );
  }
}
