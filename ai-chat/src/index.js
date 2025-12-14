export default {
  async fetch(request, env) {
    const body = await request.json()

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        // 👇 ここが超重要 明示的に
        input: body.messages.map(m => m.content).join("\n"),
        // 👇 これを明示
        response_format: { type: "text" }
      })
    })

    const data = await res.json()

    // 👇 これが一番安定する取り方
    const text = data.output_text ?? ""

    return new Response(
      JSON.stringify({ text }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
}
