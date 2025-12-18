const category = document.body.dataset.category || "A";

const form = document.getElementById("ai-form");
const input = document.getElementById("ai-input");
const messages = document.getElementById("ai-messages");

const USER_NAME = "Robban"; // eller "Du"
const AI_NAME = "MittPsyke";

// Startmeddelande per kategori
const introByCategory = {
  A: "Hej 💛 Jag är här med dig. Vill du berätta vad som känns oroligt just nu?",
  B: "Hej 💛 Vi kan ta det lugnt här. Vad har känts tyngst på sistone?",
  E: "Hej 💛 Du bestämmer helt själv vad du vill dela. Jag lyssnar, och du har kontroll här."
};

addMessage("bot", introByCategory[category] || introByCategory.A);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        category: category
      })
    });

    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) {
      const msg = (data && data.error) || `Fel ${res.status}`;
      if (String(msg).toLowerCase().includes('api key')) {
        throw new Error('missing_api_key');
      }
      throw new Error(msg);
    }

    addMessage("bot", data.answer || "Jag är här med dig.");

  } catch (err) {
    if (err?.message === 'missing_api_key') {
      addMessage("bot", "AI:n är offline just nu (saknar API-nyckel). Lägg in nyckeln och prova igen.");
      return;
    }
    addMessage(
      "bot",
      "Det blev ett tekniskt fel. Vill du prova igen?"
    );
  }
});

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = role === "user" ? USER_NAME : AI_NAME;

  const bubble = document.createElement("div");
  bubble.className = "content";
  bubble.textContent = text;

  wrapper.appendChild(name);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);

  messages.scrollTop = messages.scrollHeight;
}
