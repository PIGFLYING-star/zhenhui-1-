/** @type {import('@cloudflare/pages-plugin-types').PagesFunction} */
export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // 处理预检OPTIONS请求
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET：获取所有留言
    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, content, create_time FROM messages ORDER BY id DESC"
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    // POST：新增留言
    if (request.method === "POST") {
      const body = await request.json();
      const content = String(body.content || "").trim();
      if (!content || content.length > 200) {
        return Response.json({ error: "内容不能为空且不超过200字" }, { status: 400, headers: corsHeaders });
      }
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      await env.DB.prepare(
        "INSERT INTO messages (content, create_time) VALUES (?, ?)"
      ).bind(content, timeStr).run();
      return Response.json({ success: true }, { status: 201, headers: corsHeaders });
    }

    return Response.json({ error: "方法不允许" }, { status: 405, headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err.message) }, { status: 500, headers: corsHeaders });
  }
}
