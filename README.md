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

## Prerequisites

Before running this project, create accounts for:

- [Box Platform](https://account.box.com/signup/developer)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- OpenAI

You also need:

- [Node.js](https://nodejs.org/)

## Setup

### 1. Installation

Clone the repository:

```bash
git clone https://github.com/box-community/portal-semantic-search-mongodb.git
cd portal-semantic-search-mongodb
````

Install dependencies:

```bash
npm install
```

### 2. Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Box developer token (for testing)
BOX_DEVELOPER_TOKEN=

# Box client ID and client secret (for production)
BOX_CLIENT_ID=
BOX_CLIENT_SECRET=

BOX_ROOT_FOLDER_ID=0  # Box folder ID to sync (0 = root)

# MongoDB Atlas
MONGODB_URI=

# OpenAI
OPENAI_API_KEY=sk-...
```

### Box Setup

Create a Box application in the developer console:

1. Create a **Platform App**
2. Generate a **Developer Token**
3. Set access to **App + Enterprise Access**

Then in your Box account:

Create a folder called:

```
Books
```

Upload test documents to this folder.

This repository includes sample public-domain books from Project Gutenberg.

⚠️ Box developer tokens expire after **1 hour**. For production deployments, use Client ID and Client Secret credentials instead.

### MongoDB Setup

Create a cluster in MongoDB Atlas.

Create database and collection:

```
Database: box_portal
Collection: content
```

Then create a **Vector Search Index** called:

```
content_vector_index
```

Use this configuration:

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

## Document Ingestion

Run the sync script:

```bash
npm run sync
```

This script:

1. Retrieves files from Box
2. Downloads supported file types
3. Extracts raw text
4. Chunks text into overlapping segments
5. Generates vector embeddings
6. Stores embeddings in MongoDB

Supported formats:

* pdf
* doc
* docx
* txt
* md

Example output:

```
Processing (1/5): a-christmas-carol.txt
Chunks |████████████████████████████████| 129/129
Saving 129 chunks to MongoDB... done.
```

For this demo app, limit ingestion to **10 documents or fewer**.

## Running the App

Start the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

Example query:

```
kids who can fly
```

The app should return **Peter Pan**, demonstrating semantic search.

## Project Structure

```
scripts/
├── sync.ts                # CLI: Box → MongoDB sync

src/
├── app/
│   ├── api/
│   │   ├── search/        # Semantic search API
│   └── page.tsx           # Landing + search
├── components/
│   ├── ui/                # Shadcn components
│   ├── search-bar.tsx
│   ├── content-card.tsx
│   └── content-grid.tsx
└── lib/
    ├── box.ts             # Box API client
    ├── mongodb.ts         # MongoDB connection
    ├── embeddings.ts      # OpenAI embeddings
    ├── chunking.ts        # Text chunking for embeddings
    ├── text-extraction.ts 
    ├── content-sync.ts
    └── vector-search.ts
```

## Getting Production Ready

* Replace developer token with Client ID and Client Secret credentials
* Implement Box Webhooks for incremental sync
* Add authentication to restrict access to content based on permissions
* Add caching for embeddings


## Future Enhancements

Potential extensions for this project:

* Add document preview using Box UI Elements
* Expand document format support
* Semantic summarization of documents
* RAG-based AI chat over Box content
* Search analytics and feedback loop
* Multi-tenant content portals

## Resources

* Box Developer Platform
* MongoDB Atlas Vector Search
* OpenAI Embeddings Guide
* Next.js Documentation
* shadcn/ui


