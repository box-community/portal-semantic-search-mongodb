import { config } from "dotenv";
import { syncFolderToMongoDB } from "../src/lib/content-sync";
import { closeDb } from "../src/lib/mongodb";

config({ path: ".env.local" });
console.log(process.env.MONGODB_URI);
async function main() {
  const folderId =
    process.argv.find((a) => a.startsWith("--folder-id="))?.split("=")[1] ??
    process.env.BOX_ROOT_FOLDER_ID ??
    "0";

  console.log(`Syncing Box folder ${folderId} to MongoDB...`);

  try {
    const result = await syncFolderToMongoDB(folderId);
    await closeDb();

    console.log(`\nDone. Synced ${result.synced} of ${result.total} files.`);
    if (result.skipped > 0) {
      console.log(`Skipped: ${result.skipped}`);
    }
    if (result.errors.length > 0) {
      console.log(`\nErrors (${result.errors.length}):`);
      result.errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
    }

    process.exit(0);
  } catch (err) {
    await closeDb();
    console.error("Sync failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
