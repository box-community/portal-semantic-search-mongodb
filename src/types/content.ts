import { ObjectId } from "mongodb";

export interface ContentChunk {
  _id?: ObjectId;
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
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

/** @deprecated Alias for ContentChunk */
export type ContentDocument = ContentChunk;

export interface SearchResult extends Omit<ContentChunk, "embedding"> {
  score?: number;
}
