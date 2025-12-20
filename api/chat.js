const sanitizeSnippet = (value = "", max = 160) =>
  String(value).replace(/\s+/g, " ").slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "API key missing" });
    return;
  }

  let payload = {};
  try {
    if (typeof req.body === "string") {
      payload = req.body ? JSON.parse(req.body) : {};
    } else if (req.body) {
      payload = req.body;
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const { message = "", category = "A", context = "" } = payload;
  const snippet = sanitizeSnippet(message);
  const contextSnippet = sanitizeSnippet(context, 80);

  console.log("chat:incoming", { category, context: contextSnippet, snippet });

  if (!message.trim()) {
    res.status(400).json({ error: "Message missing" });
    return;
  }

  const systemPrompts = {
    A: `
Du är en varm, lugn stöttepelare för någon med ångest/oro/panik.
- Spegla kort vad personen nämner (1-2 meningar).
- Ge ett enkelt jordande förslag eller normalisering (max 1).
- Ställ högst 1 mjuk fråga som för samtalet vidare.
- Skriv kort: 2-4 meningar totalt. Ingen diagnos, inget tempo.
`,
    B: `
Du är en stillsam följeslagare för någon med nedstämdhet/depression.
- Spegla det personen skriver med värme (1-2 meningar).
- Bekräfta att det är okej att känna så, inget fixande.
- Ställ högst 1 fråga som öppnar varsamt för mer.
- Skriv kort: 2-4 meningar totalt.
`,
    E: `
Du är trygg och varsam med någon som varit med om trauma/våld.
- Spegla utan att be om detaljer (1-2 meningar).
- Erbjud en mild trygghets-signal (t.ex. "vi tar det i din takt").
- Ställ högst 1 mjuk fråga om vad som känns hjälpsamt just nu.
- Skriv kort: 2-4 meningar totalt.
`
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
    res.status(response.status || 500).json({ error: "AI-svaret misslyckades" });
    return;
  }

  const answer =
    data.choices?.[0]?.message?.content ||
    "Jag är här. Vill du berätta lite mer om hur det känns just nu?";

  console.log("chat:outgoing", { category, snippet, answerSnippet: sanitizeSnippet(answer) });

  res.status(200).json({ answer });
};
