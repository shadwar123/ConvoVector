import readlinePromises from "readline/promises";
import { RunnableInterface } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { ReadableStream } from "node:stream/web";

// chat handler function type that takes the user question as input
// and returns the answer as Langchain Runnable output
export type ChatHandler = (question: string) => Promise<{
  answer:
    | ReturnType<RunnableInterface["invoke"]>
    | ReturnType<RunnableInterface["stream"]>;

  sources?: string[];
  answerCallBack?: (answerText: string) => Promise<void>;
}>;

// ---------------- TERMINAL CHAT IMPLEMENTATION (CLI) ----------------
// This original implementation is kept for running the chatbot in the terminal.
// It has been commented out because the project now uses a browser UI.
/*
export const chat = async (handler: ChatHandler) => {
  const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    // wait for user question
    const question = await rl.question("Human: ");

    // invoke handler with the question
    const response = await handler(question);
    const answer = await response.answer;

    let answerText = "";

    if (answer instanceof ReadableStream) {
      process.stdout.write("AI:");
      let isFirstAnswerChunk = true;
      for await (const chunk of answer) {
        if (typeof chunk === "string") {
          // if chunk is a string response then just print it
          process.stdout.write(`${chunk}`);
          answerText += chunk;
        } else {
          // chunk is a streamed object, find answer and print it
          if (chunk.answer !== undefined) {
            // if its first answer chunk then add Answer heading
            if (isFirstAnswerChunk) {
              process.stdout.write("Answer: ");
              isFirstAnswerChunk = false;
            }
            process.stdout.write(`${chunk.answer}`);
            answerText += chunk.answer;
          } else {
            // for other stuff (e.g. question, context ) just print it as it is
            console.log(`${JSON.stringify(chunk)}`);

            if (chunk.context) {
              // if chunk is a RAG context then extract sources and print them
              const docs: Document[] = chunk.context;
              const sources = docs.map((doc) => doc.metadata.source);
              console.log(`Sources:\n${sources.join("\n")}`);
            }
          }
        }
      }
      console.log("\n");
    } else if (typeof answer === "string") {
      console.log(`AI: ${answer.trimStart()}`);
      answerText = answer;
    } else {
      // if LLM response is a json object then just print it
      console.log(`AI: ${JSON.stringify(answer)}`);
    }

    // if sources are provided them print them as well
    if (response.sources) {
      console.log(`Sources:\n${response.sources.join("\n")}`);
    }

    // if answer call back is provided then invoke the callback before moving to next question
    // this can be useful for maintaining the chat history
    if (response.answerCallBack) {
      await response.answerCallBack(answerText);
    }
  }
};
*/

// ---------------- BROWSER CHAT HELPER (HTTP / WEB UI) ----------------
// This helper is used by the browser-based UI: it runs the ChatHandler once
// and returns a plain JSON-friendly answer and sources.
export const runChatOnce = async (
  handler: ChatHandler,
  question: string,
): Promise<{ answer: string; sources?: string[] }> => {
  const response = await handler(question);
  const answerResult = await response.answer;

  let answerText = "";

  if (answerResult instanceof ReadableStream) {
    let isFirstAnswerChunk = true;
    for await (const chunk of answerResult as ReadableStream<any>) {
      if (typeof chunk === "string") {
        answerText += chunk;
      } else if ((chunk as any).answer !== undefined) {
        if (isFirstAnswerChunk) {
          isFirstAnswerChunk = false;
        }
        answerText += (chunk as any).answer;
      }
    }
  } else if (typeof answerResult === "string") {
    answerText = answerResult.trimStart();
  } else {
    answerText = JSON.stringify(answerResult);
  }

  if (response.answerCallBack) {
    await response.answerCallBack(answerText);
  }

  return {
    answer: answerText,
    sources: response.sources,
  };
};

