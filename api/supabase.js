/* Vercel Serverless 代理
   作用：把 /api/supabase/* 的请求转发到 Supabase
   解决国内无法直接访问 supabase.co 的问题
*/
module.exports = async function handler(req, res) {
  /* CORS：允许任何来源（游戏在自己的域名下） */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,apikey,authorization,prefer,x-client-info');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const SUPABASE = process.env.SUPABASE_URL || 'https://jibbshqjhtawfcbwxigby.supabase.co';
  const ANON = process.env.SUPABASE_ANON_KEY || '';

  /* 取出 /api/supabase 后面的路径 */
  let path = req.url || '/';
  const marker = '/api/supabase';
  const idx = path.indexOf(marker);
  if (idx >= 0) path = path.slice(idx + marker.length) || '/';
  if (!path.startsWith('/')) path = '/' + path;

  const target = SUPABASE + path;

  /* 过滤掉不该转发的头 */
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const lk = k.toLowerCase();
    if (['host', 'connection', 'content-length', 'accept-encoding'].includes(lk)) continue;
    headers[k] = v;
  }
  /* 确保 apikey / authorization 存在 */
  if (!headers['apikey'] && !headers['Apikey'] && ANON) headers['apikey'] = ANON;
  if (!headers['authorization'] && !headers['Authorization'] && ANON) {
    headers['authorization'] = 'Bearer ' + ANON;
  }
  /* 去掉可能存在的 gzip 请求 */
  delete headers['accept-encoding'];
  delete headers['Accept-Encoding'];

  try {
    const init = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      /* Vercel 会自动解析 body，转回字符串 */
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      headers['content-type'] = 'application/json';
    }

    const upstream = await fetch(target, init);
    const text = await upstream.text();

    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.send(text);
  } catch (e) {
    res.status(502).json({ error: 'proxy_failed', message: String(e && e.message ? e.message : e) });
  }
};
