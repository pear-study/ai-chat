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
        input: body.messages.map(m => ({
          role: m.role,
          content: [{ type: "text", text: m.content }]
        }))
      })
    })

    const data = await res.json()

    // 👇 Responses API の正しい取り方
    const text =
      data.output?.[0]?.content?.find(c => c.type === "output_text")?.text
      ?? ""

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
