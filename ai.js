let contextRaw = new URLSearchParams(window.location.search).get("context") || "";
// Normalize context: strip leading/trailing slashes and optional "portaler/" prefix
contextRaw = contextRaw.replace(/^\/+|\/+$/g, "");
if (contextRaw.toLowerCase().startsWith("portaler/")) {
  contextRaw = contextRaw.slice("portaler/".length);
}
const context = contextRaw.toLowerCase();

const contextToCategory = {
  angest: "A",
  "\u00e5ngest": "A",
  depression: "B",
  trauma: "E",
  sjalvmordstankar: "E",
  "sj\u00e4lvmordstankar": "E",
  sjalvskadebeteende: "E",
  "sj\u00e4lvskadebeteende": "E"
};

const friendlyLabelByContext = {
  angest: "\u00c5ngest",
  "\u00e5ngest": "\u00c5ngest",
  depression: "Depression",
  trauma: "Trauma",
  sjalvmordstankar: "Sj\u00e4lvmordstankar",
  "sj\u00e4lvmordstankar": "Sj\u00e4lvmordstankar",
  sjalvskadebeteende: "Sj\u00e4lvskadebeteende",
  "sj\u00e4lvskadebeteende": "Sj\u00e4lvskadebeteende"
};

const categoryFromBody = document.body.dataset.category || "A";
const category = contextToCategory[context] || categoryFromBody || "A";
document.body.dataset.category = category;

const form = document.getElementById("ai-form");
const input = document.getElementById("ai-input");
const messages = document.getElementById("ai-messages");
const contextNote = document.getElementById("ai-context-note");

const USER_NAME = "Robban"; // eller "Du"
const AI_NAME = "MittPsyke";

// Startmeddelande per kategori
const introByCategory = {
  A: "Hej! Jag \u00e4r h\u00e4r med dig. Vill du ber\u00e4tta vad som k\u00e4nns oroligt just nu?",
  B: "Hej! Vi kan ta det lugnt h\u00e4r. Vad har k\u00e4nts tyngst p\u00e5 sistone?",
  E: "Hej! Du best\u00e4mmer helt sj\u00e4lv vad du vill dela. Jag lyssnar, och du har kontroll h\u00e4r."
};

const introByContext = {
  angest: "Du har valt \u00c5ngest \u2013 jag finns h\u00e4r. Vill du ber\u00e4tta lite om hur det k\u00e4nns?",
  depression: "Du har valt Depression \u2013 vi tar det lugnt. Vill du ber\u00e4tta vad som k\u00e4nts tyngst?",
  trauma: "Du har valt Trauma \u2013 du har kontroll h\u00e4r. Vill du dela n\u00e5got litet om hur du har det?",
  sjalvmordstankar: "Du har valt Sj\u00e4lvmordstankar \u2013 jag lyssnar utan att d\u00f6ma. Vill du ber\u00e4tta hur det k\u00e4nns just nu?",
  sjalvskadebeteende: "Du har valt Sj\u00e4lvskadebeteende \u2013 vi tar det varsamt. Vill du s\u00e4ga n\u00e5got om vad som triggar mest?"
};

const intro = introByContext[context] || introByCategory[category] || introByCategory.A;

if (contextNote) {
  const label = friendlyLabelByContext[context];
  if (label) {
    contextNote.textContent = `Du valde ${label} \u2013 jag finns h\u00e4r, vill du ber\u00e4tta lite?`;
    contextNote.style.display = "block";
  } else {
    contextNote.style.display = "none";
  }
}

addMessage("bot", intro);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        category: category,
        context: context
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

    addMessage("bot", data.answer || "Jag \u00e4r h\u00e4r med dig.");

  } catch (err) {
    if (err?.message === 'missing_api_key') {
      addMessage("bot", "AI:n \u00e4r offline just nu (saknar API-nyckel). L\u00e4gg in nyckeln och prova igen.");
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

