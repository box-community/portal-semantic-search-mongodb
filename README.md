# Box Content Portal

<img width="2762" height="1018" alt="CleanShot 2026-03-06 at 16 16 58@2x" src="https://github.com/user-attachments/assets/060a9d8e-ce4d-4d81-b72e-ecc02435f499" />

A content portal powered by Box and Next.js with semantic search via MongoDB Atlas Vector Search.

## Features

- **Box Integration**: Sync content from Box folders (PDF, DOCX, TXT, MD)
- **Chunked Embeddings**: Documents are split into chunks (~1500 chars) before embedding for better retrieval
- **Semantic Search**: Find documents by meaning using OpenAI embeddings and MongoDB Vector Search
- **Modern UI**: Clean Shadcn-powered interface with responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Shadcn/ui, Tailwind CSS
- **Content**: Box API (box-node-sdk)
- **Database**: MongoDB Atlas
- **Search**: MongoDB Atlas Vector Search + OpenAI embeddings

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Box - use one of:
# Option A: Developer token (quick testing)
BOX_DEVELOPER_TOKEN=

# Option B: JWT config (production) - paste JSON from Box Developer Console
#BOX_CONFIG_JSON='{"boxAppSettings":{...},"enterpriseId":"..."}'

BOX_ROOT_FOLDER_ID=0  # Box folder ID to sync (0 = root)

# MongoDB Atlas
MONGODB_URI=

# OpenAI
OPENAI_API_KEY=sk-...
```

### 3. MongoDB Vector Search Index

Create a vector search index on the `content` collection in Atlas:

1. Go to Atlas → Database → Search Indexes
2. Create Index → JSON Editor
3. Use this definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "type"
    }
  ]
}
```

Name the index `content_vector_index`.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Sync content

Run the sync script to index Box content into MongoDB:

```bash
npm run sync
```

To sync a specific folder:

```bash
npm run sync -- --folder-id=123456789
```

Then search for content using natural language in the app.

## Project Structure

```
scripts/
├── sync.ts             # CLI: Box → MongoDB sync

src/
├── app/
│   ├── api/
│   │   ├── search/     # Semantic search API
│   │   └── content/    # Content detail API
│   ├── content/[id]/   # Content detail page
│   └── page.tsx        # Landing + search
├── components/
│   ├── ui/             # Shadcn components
│   ├── search-bar.tsx
│   ├── content-card.tsx
│   └── content-grid.tsx
└── lib/
    ├── box.ts          # Box API client
    ├── mongodb.ts      # MongoDB connection
    ├── embeddings.ts   # OpenAI embeddings
    ├── chunking.ts     # Text chunking for embeddings
    ├── text-extraction.ts
    ├── content-sync.ts
    └── vector-search.ts
```

## Supported File Types

- **PDF**: Full text extraction
- **DOCX/DOC**: Full text extraction
- **TXT/MD**: Direct read
- **Others**: Filename + metadata only

## Chunked Storage

Documents are chunked (paragraphs → sentences, ~1500 chars with 150 char overlap) before embedding. Each chunk is stored as a separate MongoDB document with full file metadata (`boxFileId`, `name`, `type`, etc.) for filtering and display.

**Migration**: If you have existing document-level data (one doc per file), run a full re-sync after upgrading to replace with chunked documents.
