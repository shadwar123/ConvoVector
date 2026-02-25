const API_URL = "http://localhost:3000/chat";

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const textareaEl = document.getElementById("question");
const sendButtonEl = document.getElementById("send");

function appendMessage(role, text, sources) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", role === "user" ? "message-user" : "message-ai");

  const content = document.createElement("div");
  content.textContent = text;
  wrapper.appendChild(content);

  if (role === "ai" && Array.isArray(sources) && sources.length > 0) {
    const meta = document.createElement("div");
    meta.classList.add("message-meta");
    meta.textContent = `Sources: ${sources.join(", ")}`;
    wrapper.appendChild(meta);
  }

  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendQuestion(question) {
  sendButtonEl.disabled = true;
  textareaEl.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        (errorBody && errorBody.error) ||
        `Request failed with status ${response.status}`;
      appendMessage("ai", `Error: ${message}`);
      return;
    }

    const data = await response.json();
    appendMessage("ai", data.answer || "(no answer returned)", data.sources);
  } catch (error) {
    console.error("Error calling chat API:", error);
    appendMessage("ai", "Error: Unable to reach the server.");
  } finally {
    sendButtonEl.disabled = false;
    textareaEl.disabled = false;
    textareaEl.focus();
  }
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = textareaEl.value.trim();
  if (!question) return;

  appendMessage("user", question);
  textareaEl.value = "";

  void sendQuestion(question);
});

textareaEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formEl.dispatchEvent(new Event("submit"));
  }
});

