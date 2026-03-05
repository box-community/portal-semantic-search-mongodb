import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDb } from "@/lib/mongodb";

async function getContent(id: string) {
  const db = await getDb();
  const collection = db.collection("content");

  const chunks = await collection
    .find({ boxFileId: id }, { projection: { embedding: 0 } })
    .sort({ chunkIndex: 1 })
    .toArray();

  if (!chunks.length) return null;

  const first = chunks[0];
  const content = chunks.map((c) => c.content).join("\n\n");

  return {
    id: first.boxFileId,
    boxFileId: first.boxFileId,
    name: first.name,
    type: first.type,
    size: first.size,
    modifiedAt: first.modifiedAt,
    downloadUrl: first.downloadUrl,
    content,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getContent(id);

  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to search
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                <div>
                  <h1 className="text-2xl font-semibold truncate">
                    {content.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{content.type.toUpperCase()}</Badge>
                    {content.size > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(content.size)}
                      </span>
                    )}
                    {content.modifiedAt && (
                      <span className="text-sm text-muted-foreground">
                        Modified {formatDate(content.modifiedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {content.downloadUrl && (
                <Button asChild size="sm" className="shrink-0">
                  <a
                    href={content.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {content.content ? (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {content.content}
                </pre>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-sm">
                No text content available for preview. Use the download button to
                access the file.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
