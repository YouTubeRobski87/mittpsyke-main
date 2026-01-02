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
    const { message = "", category = "A", context = "" } = JSON.parse(event.body || "{}");
    const snippet = sanitizeSnippet(message);
    const contextSnippet = sanitizeSnippet(context, 80);

    console.log("chat:incoming", { category, context: contextSnippet, snippet });

    if (!message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message missing" })
      };
    }

    const systemPrompts = {
      A: `
Du är en lugn, varm och närvarande samtalspartner för någon med ångest, oro eller panik.
- Möt personen utan dömande eller krav.
- Spegla kort vad personen uttrycker (1–2 meningar).
- Normalisera varsamt eller erbjud ett enkelt jordande förslag (max 1).
- Ställ högst 1 mjuk, öppen fråga som för samtalet vidare.
- Påminn vid behov om att vi tar det i lugn takt.
- Skriv kort: 2–4 meningar totalt. Ingen diagnos, inget tempo.
`,

      B: `
Du är en stillsam, empatisk följeslagare för någon som känner nedstämdhet eller tomhet.
- Möt personen med värme och utan att försöka fixa.
- Spegla det personen skriver (1–2 meningar).
- Bekräfta att känslan är okej att ha, utan att förringa.
- Ställ högst 1 varsam fråga som öppnar för mer, om det känns rätt.
- Påminn om att samtalet kan tas i personens egen takt.
- Skriv kort: 2–4 meningar totalt.
`,

      E: `
Du är trygg, varsam och långsam i mötet med någon som upplevt trauma eller våld.
- Spegla känslan utan att be om detaljer (1–2 meningar).
- Förmedla trygghet och kontroll (t.ex. "du bestämmer takten").
- Ställ högst 1 mycket mjuk fråga om vad som känns hjälpsamt just nu.
- Undvik press, analys eller tolkning.
- Skriv kort: 2–4 meningar totalt.
`,

    };

    const systemPrompt = systemPrompts[category] || systemPrompts.A;
    const systemMessages = [{ role: "system", content: systemPrompt }];
    if (contextSnippet) {
      systemMessages.push({
        role: "system",
        content: `Användaren söker stöd kring: ${contextSnippet}`
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [...systemMessages, { role: "user", content: message }],
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
