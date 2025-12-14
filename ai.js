const API_URL = "https://nhdkblsnkvmsssybjhbd.supabase.co/functions/v1/ai-chat";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZGtibHNua3Ztc3NzeWJqaGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Nzc2NjIsImV4cCI6MjA4MTE1MzY2Mn0.PENh2IvC4zyVO0oNkYSc6hMHRIGYN0RiV8TRWGwA3fM";

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
      const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ANON_KEY}`,
    "apikey": ANON_KEY
  },
  body: JSON.stringify({ message: text })
});

console.log("STATUS:", response.status);
console.log("OK:", response.ok);


      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
        "apikey": ANON_KEY
      },
      body: JSON.stringify({ message: text })
    });

    const textResponse = await response.text();
    pTag.textContent = textResponse;
    chat.scrollTop = chat.scrollHeight;

  } catch (err) {
    pTag.textContent = "Jag kunde tyvärr inte svara just nu 💛";
    console.error(err);
  }
}
