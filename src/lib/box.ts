import { Readable } from "stream";
import { BoxClient, BoxDeveloperTokenAuth, BoxCcgAuth, CcgConfig } from "box-node-sdk";

interface BoxItem {
  id: string;
  type: string;
  name?: string;
  extension?: string;
  size?: number;
  modifiedAt?: unknown;
  parent?: { id: string };
}

export interface BoxFileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: Date;
  parentId: string;
}

let cachedClient: BoxClient | null = null;

export function getBoxClient(): BoxClient {
  if (cachedClient) return cachedClient;

  const devToken = process.env.BOX_DEVELOPER_TOKEN;
  const clientId = process.env.BOX_CLIENT_ID
  const clientSecret = process.env.BOX_CLIENT_SECRET;

  if (devToken) {
    const auth = new BoxDeveloperTokenAuth({ token: devToken });
    cachedClient = new BoxClient({ auth });
    return cachedClient;
  }
  else if (clientId && clientSecret) {
    const config = new CcgConfig({ clientId, clientSecret });
    const auth = new BoxCcgAuth({ config });
    cachedClient = new BoxClient({ auth });
    return cachedClient;
  }
  else {
    throw new Error("BOX_DEVELOPER_TOKEN or (BOX_CLIENT_ID and BOX_CLIENT_SECRET) must be set");
  }
}

export async function listFolderContents(folderId: string): Promise<BoxItem[]> {
  const client = getBoxClient();
  const result = await client.folders.getFolderItems(folderId, {
    queryParams: { limit: 1000, fields: ["name", "type", "extension", "size", "modified_at", "parent"] },
  });
  //console.log(result.entries);
  return (result.entries ?? []) as BoxItem[];
}

export async function getAllFilesRecursive(
  folderId: string,
  files: BoxFileInfo[] = []
): Promise<BoxFileInfo[]> {
  const items = await listFolderContents(folderId);

  for (const item of items) {
    //console.log(item);
    if (item.type === "file") {
      files.push({
        id: item.id,
        name: item.name ?? "Unknown",
        type: (item.extension ?? "unknown").toLowerCase(),
        size: item.size ?? 0,
        modifiedAt: item.modifiedAt ? new Date(String(item.modifiedAt)) : new Date(),
        parentId: folderId,
      });
    } else if (item.type === "folder") {
      await getAllFilesRecursive(item.id, files);
    }
  }

  return files;
}

export async function getFileMetadata(fileId: string): Promise<BoxFileInfo> {
  const client = getBoxClient();
  const file = await client.files.getFileById(fileId);
  return {
    id: file.id,
    name: file.name ?? "Unknown",
    type: (file.extension ?? "unknown").toLowerCase(),
    size: file.size ?? 0,
    modifiedAt: file.modifiedAt ? new Date(String(file.modifiedAt)) : new Date(),
    parentId: file.parent?.id ?? "0",
  };
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function downloadFileAsBuffer(fileId: string): Promise<Buffer> {
  const client = getBoxClient();
  console.log("Downloading file:", fileId);
  const stream = await client.downloads.downloadFile(fileId);
  if (!stream) {
    throw new Error("Download returned empty stream");
  }
  return streamToBuffer(stream as Readable);
}

export async function getDownloadUrl(fileId: string): Promise<string | undefined> {
  const client = getBoxClient();
  const file = await client.files.getFileById(fileId, {
    queryParams: { fields: ["shared_link"] },
  });
  const sharedLink = (file as { sharedLink?: { downloadUrl?: string; url?: string } }).sharedLink;
  if (sharedLink?.downloadUrl) return sharedLink.downloadUrl;
  if (sharedLink?.url) return sharedLink.url;
  return undefined;
}
