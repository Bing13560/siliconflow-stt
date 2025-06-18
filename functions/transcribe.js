export async function onRequestPost({ request, env }) {
  const apiKeys = (env.SILICONFLOW_API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  const form = await request.formData();
  
  // 在这个新流程中，我们只处理文件上传，不再处理 URL
  const file = form.get('file');
  if (!file) {
      return new Response('A file must be provided.', { status: 400 });
  }

  const headers = { 'Authorization': `Bearer ${randomKey}` };

  const resp = await fetch(
    'https://api.siliconflow.cn/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: headers,
      body: form // 直接转发收到的 form
    }
  );

  const data = await resp.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
