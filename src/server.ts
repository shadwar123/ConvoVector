import http, { IncomingMessage, ServerResponse } from "http";
import dotenv from "dotenv";
import { chatHandler } from "./ragGoogle/ragWithChatHistory.js";
import { runChatOnce } from "./utils/chat.js";

dotenv.config();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.writeHead(400, corsHeaders);
    res.end("Bad Request");
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.url === "/chat" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const question = typeof parsed.question === "string" ? parsed.question : "";

        if (!question) {
          res.writeHead(400, {
            ...corsHeaders,
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "Missing 'question' in request body." }));
          return;
        }

        const result = await runChatOnce(chatHandler, question);

        res.writeHead(200, {
          ...corsHeaders,
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error("Error handling /chat request:", error);
        res.writeHead(500, {
          ...corsHeaders,
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ error: "Internal server error." }));
      }
    });

    return;
  }

  res.writeHead(404, corsHeaders);
  res.end("Not Found");
};

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = http.createServer(handleRequest);

server.listen(port, () => {
  console.log(`RAG chat server (browser UI) running on http://localhost:${port}`);
});

