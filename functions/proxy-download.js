export async function onRequestPost({ request }) {
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response('URL is required', { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.iesdouyin.com/' // 添加 Referer 头，增强伪装
      }
    });

    if (!response.ok) {
      return new Response(`Failed to download file from URL: ${url}`, { status: response.status });
    }

    // 直接将原始响应体作为代理响应返回
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': response.headers.get('Content-Length') || '',
      }
    });

  } catch (error) {
    console.error('Error proxying download:', error);
    return new Response(error.message || 'Failed to proxy download', { status: 500 });
  }
}