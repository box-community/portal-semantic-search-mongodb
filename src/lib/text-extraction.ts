import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const SUPPORTED_TYPES = ["pdf", "docx", "doc", "txt", "md"];

export function isExtractable(type: string): boolean {
  return SUPPORTED_TYPES.includes(type.toLowerCase());
}

export async function extractText(buffer: Buffer, type: string): Promise<string> {
  const ext = type.toLowerCase();

  switch (ext) {
    case "pdf": {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        await parser.destroy();
        return result.text || "";
      } catch (err) {
        await parser.destroy();
        throw err;
      }
    }
    case "docx":
    case "doc":
      const docResult = await mammoth.extractRawText({ buffer });
      return docResult.value || "";
    case "txt":
    case "md":
      return buffer.toString("utf-8");
    default:
      return "";
  }
}
