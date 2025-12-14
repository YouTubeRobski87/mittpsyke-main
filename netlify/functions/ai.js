export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Only POST allowed",
    };
  }

  const { message } = JSON.parse(event.body);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: `Jag hör dig 💛 Du skrev: "${message}"`,
  };
}

