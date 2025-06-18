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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
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

  // 健壮地提取文本内容的函数
  function extractTranscription(data) {
    if (!data) return null;

    // 1. 直接在根对象查找
    if (typeof data.text === 'string') return data.text;
    if (typeof data.transcript === 'string') return data.transcript;
    if (typeof data.transcription === 'string') return data.transcription;

    // 2. 查找常见的嵌套结构
    const possibleObjects = [data.result, data.results, data.data];
    for (const obj of possibleObjects) {
        if (obj) {
            const target = Array.isArray(obj) ? obj[0] : obj;
            if (target) {
                if (typeof target.text === 'string') return target.text;
                if (typeof target.transcript === 'string') return target.transcript;
                if (typeof target.transcription === 'string') return target.transcription;
            }
        }
    }
    
    // 如果都找不到，返回 null
    return null;
  }

  const transcriptionText = extractTranscription(data);

  if (transcriptionText === null) {
      // 如果无法提取文本，返回一个包含原始数据的错误，方便未来调试
      return new Response(JSON.stringify({
          error: 'Could not extract transcription from API response.',
          originalResponse: data
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // 始终返回统一的格式给前端
  return new Response(JSON.stringify({ text: transcriptionText }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
