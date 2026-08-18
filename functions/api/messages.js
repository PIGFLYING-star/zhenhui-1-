export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  if (request.method === "GET") {
    try {
      const { results } = await db.prepare(`
        SELECT id, content, create_at 
        FROM messages 
        ORDER BY create_at DESC
      `).all();
      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  if (request.method === "POST") {
    try {
      const payload = await request.json();
      const content = String(payload.content || "").trim();
      if (!content) {
        return new Response(JSON.stringify({ error: "留言不能为空" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await db.prepare(`INSERT INTO messages(content) VALUES(?)`).bind(content).run();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return new Response("Method Not Allowed", { status: 405 });
}
