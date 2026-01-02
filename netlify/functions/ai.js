const category = document.body.dataset.category || "A";

const form = document.getElementById("ai-form");
const input = document.getElementById("ai-input");
const messages = document.getElementById("ai-messages");

const USER_NAME = "Robban"; // eller "Du"
const AI_NAME = "MittPsyke";

// Startmeddelande per kategori
const introByCategory = {
  A: "Hej 💛 Jag är här med dig. Vi kan ta det lugnt, och du behöver inte veta exakt vad du ska säga. Vad känns mest oroligt just nu?",
  
  B: "Hej 💛 Jag är här med dig. Vi tar det i din takt. Om du vill, kan du berätta lite om vad som har känts tyngst på sistone.",
  
  E: "Hej 💛 Du har kontroll här. Vi tar det steg för steg och bara så mycket som känns okej för dig. Vad skulle kännas hjälpsamt att börja med just nu?"
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
