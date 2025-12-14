export default {
  async fetch(request, env) {
    const body = await request.json()

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: body.messages,
      }),
    })

    const text = await res.text()

    // ステータスも含めて全部返す
    return new Response(
      JSON.stringify({
        status: res.status,
        headers: Object.fromEntries(res.headers),
        raw: text,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
}
