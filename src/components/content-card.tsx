"use client";

import { FileText, ExternalLink, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ContentCardProps {
  id: string;
  name: string;
  type: string;
  size?: number;
  contentSnippet?: string;
  score?: number;
  downloadUrl?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContentCard({
  id,
  name,
  type,
  size = 0,
  contentSnippet = "",
  score,
  downloadUrl,
}: ContentCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <h3 className="font-medium truncate">{name}</h3>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {type.toUpperCase()}
          </Badge>
        </div>
        {size > 0 && (
          <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button asChild variant="default" size="sm">
            <a
              href={`https://app.box.com/file/${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              View
            </a>
          </Button>
          {downloadUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
