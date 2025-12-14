export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Only POST allowed",
    };
  }

  let message = "";
  try {
    const body = JSON.parse(event.body);
    message = (body.message || "").toLowerCase();
  } catch {
    message = "";
  }

  let reply = "Jag finns här 💛 Vill du berätta lite mer?";

  // Hälsningar
  if (["hej", "hallå", "hejsan"].some(w => message.startsWith(w))) {
    reply = "Hej 💛 Vad vill du prata om just nu?";
  }

  // Förvirring / korta svar
  else if (["va", "vad", "jaha", "okej"].includes(message.trim())) {
    reply = "Det är helt okej 💛 Vill du att jag förklarar eller vill du säga något mer?";
  }

  // Stress / oro
  else if (
    message.includes("stress") ||
    message.includes("orolig") ||
    message.includes("ångest")
  ) {
    reply =
      "Det låter jobbigt 💛 När stressen eller oron kommer – var i kroppen brukar du känna den mest?";
  }

  // Trötthet / tomhet
  else if (
    message.includes("trött") ||
    message.includes("utmattad") ||
    message.includes("orkar inte")
  ) {
    reply =
      "Det låter som att du bär på mycket 💛 Har du haft möjlighet att vila något, eller känns det svårt just nu?";
  }

  // Nedstämdhet
  else if (
    message.includes("ledsen") ||
    message.includes("deppig") ||
    message.includes("tom")
  ) {
    reply =
      "Jag är ledsen att du känner så 💛 Vill du berätta vad som ligger bakom känslan?";
  }

  // Bekräftelse
  else if (
    message.includes("bra") ||
    message.includes("tack") ||
    message.includes("skönt")
  ) {
    reply = "Vad fint att höra 💛 Jag är här med dig.";
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: reply,
  };
}
