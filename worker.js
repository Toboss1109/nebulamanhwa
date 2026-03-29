const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), { status: 405, headers: CORS });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY тохируулагдаагүй. Cloudflare → Workers → Settings → Variables-д нэмнэ үү.' } }),
        { status: 500, headers: CORS }
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: { message: 'Хүсэлтийн формат буруу: ' + e.message } }),
        { status: 400, headers: CORS }
      );
    }

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      return new Response(JSON.stringify(data), { status: resp.status, headers: CORS });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: { message: 'Worker алдаа: ' + err.message } }),
        { status: 500, headers: CORS }
      );
    }
  },
};
