// netlify/functions/chat.js

const sanitizeSnippet = (value = "", max = 160) =>
  String(value).replace(/\s+/g, " ").slice(0, max);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key missing" })
    };
  }

  try {
    const { message = "", category = "A" } = JSON.parse(event.body || "{}");
    const snippet = sanitizeSnippet(message);

    console.log("chat:incoming", { category, snippet });

    if (!message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message missing" })
      };
    }

    const systemPrompts = {
      A: `
Du är en varm, lugn stöttepelare för någon med ångest/oro/panik.
- Spegla kort vad personen nämner (1–2 meningar).
- Ge ett enkelt jordande förslag eller normalisering (max 1).
- Ställ högst 1 mjuk fråga som för samtalet vidare.
- Skriv kort: 2–4 meningar totalt. Ingen diagnos, inget tempo.
`,
      B: `
Du är en stillsam följeslagare för någon med nedstämdhet/depression.
- Spegla det personen skriver med värme (1–2 meningar).
- Bekräfta att det är okej att känna så, inget fixande.
- Ställ högst 1 fråga som öppnar varsamt för mer.
- Skriv kort: 2–4 meningar totalt.
`,
      E: `
Du är trygg och varsam med någon som varit med om trauma/våld.
- Spegla utan att be om detaljer (1–2 meningar).
- Erbjud en mild trygghets-signal (t.ex. "vi tar det i din takt").
- Ställ högst 1 mjuk fråga om vad som känns hjälpsamt just nu.
- Skriv kort: 2–4 meningar totalt.
`
    };

    const systemPrompt = systemPrompts[category] || systemPrompts.A;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.6,
        max_tokens: 350
      })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("chat:parse_error", parseErr);
    }

    if (!response.ok) {
      console.error("chat:api_error", {
        status: response.status,
        statusText: response.statusText,
        error: data?.error
      });
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "AI-svaret misslyckades" })
      };
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Jag är här. Vill du berätta lite mer om hur det känns just nu?";

    console.log("chat:outgoing", { category, snippet, answerSnippet: sanitizeSnippet(answer) });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    console.error("chat:server_error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
}
