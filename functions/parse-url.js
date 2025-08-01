import { getVideoUrl } from './utils/douyin.ts';

export async function onRequestPost({ request }) {
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response('URL is required', { status: 400 });
    }

    const { directUrl, title } = await getVideoUrl(url);

    return new Response(JSON.stringify({ directUrl, title }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error parsing Douyin URL:', error);
    return new Response(error.message || 'Failed to resolve URL', { status: 500 });
  }
}