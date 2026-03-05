import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Content ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("content");

    const chunks = await collection
      .find({ boxFileId: id }, { projection: { embedding: 0 } })
      .sort({ chunkIndex: 1 })
      .toArray();

    if (!chunks.length) {
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    const first = chunks[0];
    const content = chunks.map((c) => c.content).join("\n\n");

    return NextResponse.json({
      success: true,
      content: {
        id: first.boxFileId,
        boxFileId: first.boxFileId,
        name: first.name,
        type: first.type,
        size: first.size,
        modifiedAt: first.modifiedAt,
        downloadUrl: first.downloadUrl,
        content,
      },
    });
  } catch (err) {
    console.error("Content fetch error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch content",
      },
      { status: 500 }
    );
  }
}
