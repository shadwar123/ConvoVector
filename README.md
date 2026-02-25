## ConvoVector – RAG Chatbot with Chat History

ConvoVector is a Retrieval-Augmented Generation (RAG) based chatbot built with TypeScript and LangChain.  
It supports **chat history**, so follow-up questions are contextualized using previous conversation turns.

The project currently has two main ways to interact with the chatbot:

- **Terminal mode**: classic CLI chat loop.
- **Browser mode**: simple, high‑quality web UI.

Depending on your git branch, you can focus on terminal or browser experience.

---

## Branches

- **`main`**:  
  Focuses on the original **terminal-based** RAG chatbot.

- **`browserBranch`** (recommended for web work):  
  Adds:
  - HTTP server (`src/server.ts`) exposing a `/chat` endpoint.
  - Browser UI under `src/public/` (`index.html`, `styles.css`, `main.js`).
  - Browser‑oriented `ChatHandler` implementation that returns JSON‑friendly answers.

You can switch branches with:

```bash
git checkout main          # terminal-only experience
git checkout browserBranch # browser + terminal-compatible logic
```

---

## What is RAG (Retrieval-Augmented Generation)?

**Retrieval-Augmented Generation (RAG)** is a pattern where an LLM:

1. **Retrieves relevant documents** from a vector store using **embeddings**.
2. **Augments the prompt** with those documents as context.
3. **Generates an answer** grounded in that retrieved context.

This project:

- Uses embeddings to map text into a high‑dimensional vector space.
- Stores those vectors in a vector database.
- At query time, finds semantically similar chunks and passes them to the model.
- Optionally returns **sources** so you can see where an answer came from.

---

## Project Structure (high level)

- `src/utils/chat.ts`  
  - Defines the shared `ChatHandler` type.  
  - Contains:
    - **Commented terminal chat loop** (`chat(...)`) for CLI usage.  
    - **`runChatOnce` helper** used by the browser server to execute a single chat turn and return `{ answer, sources }`.

- `src/ragGoogle/`  
  RAG implementation using Gemini / LangChain, including:
  - `ragWithChatHistory.ts` – main RAG pipeline with chat history and a browser‑friendly `chatHandler`.
  - `retriever.ts`, `embeddings.ts`, `crawlDocuments.ts`, etc. – document loading, splitting, embeddings, and retriever setup.

- `src/server.ts` (browser branch)  
  Minimal HTTP server that:
  - Accepts `POST /chat` with `{ question }`.
  - Calls `chatHandler` + `runChatOnce`.
  - Returns a JSON answer and optional sources.

- `src/public/` (browser branch)  
  - `index.html` – simple chat UI shell.  
  - `styles.css` – dark, modern chat layout.  
  - `main.js` – calls `/chat` and renders messages.

---

## Running the Terminal Chat (main branch)

> Exact entrypoint may vary depending on which RAG example you want (with/without history, Google vs OpenAI).  
> The typical pattern is:

```bash
git checkout main
npm install

# Example (adjust to your desired script/file):
npx ts-node src/ragGoogle/ragWithChatHistory.ts
```

This uses the **commented terminal chat loop** in `src/utils/chat.ts` together with a `ChatHandler` implementation in the chosen RAG file.

---

## Running the Browser Chat (browserBranch)

```bash
git checkout browserBranch
npm install

# Start the RAG HTTP server
npm run web:server
```

Then open `src/public/index.html` in a browser (or serve it with a static file server).  
The UI will send `POST` requests to `http://localhost:3000/chat` and display:

- User messages
- AI answers
- Optional **sources** from the RAG retriever

---

## Environment Variables

You will need an `.env` file with the required keys for your chosen LLM and vector store, for example:

```bash
GOOGLE_API_KEY=...
OPENAI_API_KEY=...
PINECONE_API_KEY=...
```

Make sure these values are set before running either the terminal or browser chat.

