import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty for embedding");
  }

  const truncated = text.length > 30000 ? text.slice(0, 30000) + "..." : text;

  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncated,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddingForSearch(query: string): Promise<number[]> {
  return generateEmbedding(query);
}
