export async function onRequest(context) {
  // 只允许 POST 请求
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { url } = await context.request.json();
    if (!url || !url.startsWith('http')) {
      return new Response('A valid URL is required', { status: 400 });
    }

    const resolverUrl = `https://brhiza-douyinvd-67.deno.dev/?url=${encodeURIComponent(url)}`;

    const response = await fetch(resolverUrl);

    if (!response.ok) {
      // 将外部服务的错误状态转发给客户端
      return new Response(`Failed to resolve URL: ${response.statusText}`, { status: response.status });
    }

    const directVideoUrl = await response.text();

    // 将直链作为 JSON 返回
    return new Response(JSON.stringify({ directUrl: directVideoUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in /parse-url:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}