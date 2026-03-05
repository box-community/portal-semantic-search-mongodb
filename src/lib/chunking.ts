const CHUNK_SIZE = 1500;
const OVERLAP = 150;

/**
 * Recursive character split: paragraphs → sentences → fixed size.
 * Merges segments up to chunkSize with overlap between chunks.
 */
export function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const segments: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= CHUNK_SIZE) {
      segments.push(para);
    } else {
      const sentences = para.split(/(?<=[.!?])\s+/);
      let buf = "";
      for (const sent of sentences) {
        const candidate = buf ? buf + " " + sent : sent;
        if (candidate.length <= CHUNK_SIZE) {
          buf = candidate;
        } else {
          if (buf) segments.push(buf);
          buf = sent;
        }
      }
      if (buf) segments.push(buf);
    }
  }

  const chunks: string[] = [];
  let current = "";
  let overlapBuffer = "";

  for (const seg of segments) {
    const candidate = current ? current + "\n\n" + seg : seg;

    if (candidate.length <= CHUNK_SIZE) {
      current = candidate;
    } else {
      if (current) {
        chunks.push(current);
        overlapBuffer = current.slice(-OVERLAP);
      }
      current = (overlapBuffer ? overlapBuffer + " " : "") + seg;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
