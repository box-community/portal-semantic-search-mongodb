import cliProgress from "cli-progress";
import { getDb } from "./mongodb";
import { getAllFilesRecursive, downloadFileAsBuffer, getDownloadUrl } from "./box";
import { extractText, isExtractable } from "./text-extraction";
import { generateEmbedding } from "./embeddings";
import { ensureVectorIndex } from "./vector-search";
import { chunkText } from "./chunking";
import type { ContentChunk } from "@/types/content";

export interface SyncResult {
  total: number;
  synced: number;
  skipped: number;
  errors: { fileId: string; name: string; error: string }[];
}

export async function syncFolderToMongoDB(folderId: string): Promise<SyncResult> {
  const result: SyncResult = { total: 0, synced: 0, skipped: 0, errors: [] };

  await ensureVectorIndex();

  const files = await getAllFilesRecursive(folderId);
  result.total = files.length;

  if (files.length === 0) {
    console.log("No files found to sync.");
    return result;
  }

  const db = await getDb();
  const collection = db.collection<ContentChunk>("content");

  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    console.log(`\nProcessing (${fileIndex + 1}/${files.length}): ${file.name}`);
    try {
      let content = "";

      if (isExtractable(file.type)) {
        try {
          const buffer = await downloadFileAsBuffer(file.id);
          content = await extractText(buffer, file.type);
        } catch (extractErr) {
          result.errors.push({
            fileId: file.id,
            name: file.name,
            error: `Extraction failed: ${extractErr instanceof Error ? extractErr.message : String(extractErr)}`,
          });
          result.skipped++;
          continue;
        }
      } else {
        content = file.name;
      }

      const chunks = content.trim().length > 0 ? chunkText(content) : [file.name];
      const totalChunks = chunks.length;

      const chunkBar = new cliProgress.SingleBar(
        {
          format: "Chunks |{bar}| {percentage}% | {value}/{total} chunks",
          barCompleteChar: "\u2588",
          barIncompleteChar: "\u2591",
          hideCursor: true,
        },
        cliProgress.Presets.shades_classic
      );
      chunkBar.start(totalChunks, 0);

      try {
        let downloadUrl: string | undefined;
        try {
          downloadUrl = await getDownloadUrl(file.id);
        } catch {
          // Non-fatal
        }

        const now = new Date();
        const chunkDocs: ContentChunk[] = [];

        for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        let embedding: number[] = [];

        if (chunkContent.trim().length > 0) {
          try {
            embedding = await generateEmbedding(chunkContent);
          } catch (embedErr) {
            result.errors.push({
              fileId: file.id,
              name: file.name,
              error: `Embedding failed for chunk ${i + 1}: ${embedErr instanceof Error ? embedErr.message : String(embedErr)}`,
            });
            result.skipped++;
            chunkBar.update(i + 1);
            continue;
          }
        }

        chunkDocs.push({
          boxFileId: file.id,
          boxFolderId: file.parentId,
          name: file.name,
          type: file.type,
          size: file.size,
          modifiedAt: file.modifiedAt,
          downloadUrl,
          chunkIndex: i,
          totalChunks,
          content: chunkContent,
          embedding,
          createdAt: now,
          updatedAt: now,
        });
        chunkBar.update(i + 1);
      }

      if (chunkDocs.length === 0) {
        continue;
      }

      process.stdout.write(`  Saving ${chunkDocs.length} chunks to MongoDB...`);
      await collection.deleteMany({ boxFileId: file.id });
      await collection.insertMany(chunkDocs);
      console.log(" done.");
      result.synced++;
      } finally {
        chunkBar.stop();
      }
    } catch (err) {
      result.errors.push({
        fileId: file.id,
        name: file.name,
        error: err instanceof Error ? err.message : String(err),
      });
      result.skipped++;
    }
  }

  return result;
}
