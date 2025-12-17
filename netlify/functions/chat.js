// netlify/functions/chat.js

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
    const { message, category } = JSON.parse(event.body);

    const systemPrompts = {
      A: `
Du är en lugn, varm och närvarande stödperson.
Fokus: ångest, oro och panik.
Du hjälper genom att lyssna, spegla känslor och ge enkla jordande förslag.
Ingen press, inga diagnoser, inget tempo.
`,
      B: `
Du är en stillsam, empatisk följeslagare.
Fokus: nedstämdhet, tomhet och depression.
Du skriver mjukt, långsamt och validerande.
Du försöker inte "fixa", du finns.
`,
      E: `
Du är extra trygg, försiktig och respektfull.
Fokus: trauma och våldsutsatthet.
Inga detaljerade frågor.
All kontroll ligger hos användaren.
Trygghet först, alltid.
`
    };

    const systemPrompt =
      systemPrompts[category] || systemPrompts.A;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.6,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content ||
      "Jag hör dig. Vill du berätta lite mer?";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
}
