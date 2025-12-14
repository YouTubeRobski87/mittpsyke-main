const API_URL = "/.netlify/functions/ai";

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const chat = document.getElementById("chat-box");

  // User-bubbla
  chat.insertAdjacentHTML("beforeend", `
    <div class="msg user-msg">
      <div class="msg-label">Du</div>
      <p>${text}</p>
    </div>
  `);
  chat.scrollTop = chat.scrollHeight;
  input.value = "";

  // AI-bubbla
  const aiBubble = document.createElement("div");
  aiBubble.className = "msg ai-msg";
  aiBubble.innerHTML = `<div class="msg-label">Stöd-AI</div><p></p>`;
  chat.appendChild(aiBubble);
  const pTag = aiBubble.querySelector("p");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    console.log("STATUS:", response.status);
    console.log("OK:", response.ok);

    const reply = await response.text();
    pTag.textContent = reply;
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    pTag.textContent = "Jag kunde tyvärr inte svara just nu 💛";
    console.error(err);
  }
}
