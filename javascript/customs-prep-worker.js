// Cloudflare Worker: a private proxy for Customs Prep.
// Deploy: dash.cloudflare.com → Workers → Create → paste this → Settings → Variables →
// add secret ANTHROPIC_API_KEY. Copy the worker URL into API_ENDPOINT in Customs Prep Share.html.
const ALLOWED_ORIGIN = '*'; // set to your site's URL once hosted, e.g. 'https://customsprep.netlify.app'

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    let body;
    try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    const payload = {
      model: 'claude-sonnet-4-5',
      max_tokens: Math.min(body.max_tokens || 7000, 8000),
      system: String(body.system || ''),
      messages: Array.isArray(body.messages) ? body.messages.slice(0, 4) : []
    };
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload)
    });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, 'content-type': 'application/json' } });
  }
};
