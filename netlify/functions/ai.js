const category = document.body.dataset.category || "A";

const form = document.getElementById("ai-form");
const input = document.getElementById("ai-input");
const messages = document.getElementById("ai-messages");

const USER_NAME = "Robban"; // eller "Du"
const AI_NAME = "MittPsyke";

// Startmeddelande per kategori
const introByCategory = {
  A: "Hej 💛 Vi kan ta det i lugn takt här. Jag är med dig. Vill du berätta lite om vad som känns oroligt just nu?",
  
  B: "Hej 💛 Här finns ingen stress. Vi kan ta det som det kommer. Vill du dela något om hur det har känts på sistone?",
  
  E: "Hej 💛 Du har full kontroll här. Vi tar det i din takt, och du behöver bara dela det som känns okej för dig just nu."
};


addMessage("bot", introByCategory[category] || introByCategory.A);

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
        category: category
      })
    });

    const data = await res.json();
    addMessage("bot", data.answer || "Jag är här med dig.");

  } catch (err) {
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
