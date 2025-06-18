export async function onRequestPost({ request, env }) {
  const apiKeys = (env.SILICONFLOW_API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

  const form = await request.formData();
  const file = form.get('file');
  const url = form.get('url');

  let body;
  const headers = { 'Authorization': `Bearer ${randomKey}` };

  if (file) {
    body = form;
  } else if (url) {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(`Failed to download file from URL: ${url}`, { status: 500 });
    }
    const blob = await response.blob();
    const newForm = new FormData();
    newForm.append('file', blob, 'downloaded_file');
    newForm.append('model', form.get('model') || 'FunAudioLLM/SenseVoiceSmall');
    body = newForm;
  } else {
    return new Response('Either a file or a URL must be provided.', { status: 400 });
  }

  const resp = await fetch(
    'https://api.siliconflow.cn/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: headers,
      body: body
    }
  );

  const data = await resp.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
