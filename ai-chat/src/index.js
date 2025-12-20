export default {
  async fetch(request, env) {

    // ★CloudFlareWorkerとの連携チェック
    // リクエストを送る前にサーバ側に御用聞きをする(CORSチェック)
    // ブラウザ「POSTメソッド送ってもよいですか？？」
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    // サーバー「POST送られるのは無理・・・」→失敗！
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 })
    }

    const body = await request.json()

    // ★OPENAIとの連携
    // TODO:
    // Chat Completions API は将来 deprecated 予定。
    // 新規実装は Responses API 推奨。
    // ただし 2025-12 時点ではこちらが最も安定。
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "あなたはユーザーのそばにいるAIパートナーです。会話では評価・説教・指示をしません。助言は求められた時だけ行います。口調は穏やかで、短すぎず長すぎない返答をします。ユーザーが主役で、あなたは聞き役です。返答は以下の形式で返してください。<tags>#happy #friendly </tags><message>本文テキスト</message> tagsは0-複数可 messageにはタグを含めない"
          },
          ...body.messages
        ],
      }),
    })

    // OpenAI Chat Completions のレスポンス形式
    // チェック方法：curl -X POST https://ai-chat.ffvkbzmm49.workers.dev -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"テスト\"}]}"
    // data = {
    //   id: string,
    //   object: "chat.completion",
    //   created: number,
    //   model: string,
    //   choices: [
    //     {
    //       index: number,
    //       message: {
    //         role: "assistant",
    //         content: string,   // ← ここを使う
    //         refusal: null,
    //         annotations: []
    //       },
    //       logprobs: null,
    //       finish_reason: "stop"
    //     }
    //   ],
    //   usage: {
    //     prompt_tokens: number,
    //     completion_tokens: number,
    //     total_tokens: number
    //   }
    // }

    // 保険：openAIとの通信に失敗したら500エラー
    if (!res.ok) {
      const error = await res.text()
      return new Response(
        JSON.stringify({ error }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    const data = await res.json()

    const text = data.choices?.[0]?.message?.content ?? ""

    // string形に直してJSにレスポンスを返す
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
