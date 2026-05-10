export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: "GROQ_API_KEY is not set in Cloudflare Pages environment variables." } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { message: "Invalid JSON body." } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await groqResponse.json();

  return new Response(JSON.stringify(data), {
    status: groqResponse.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
